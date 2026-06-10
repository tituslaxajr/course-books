const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const supabase = require("../../lib/supabase");

const BUCKET = "library";
const root = path.join(__dirname, "..", "..");
const STOP_WORDS = new Set(["the", "and", "for", "with", "from", "guide", "vol", "volume", "ed", "of", "to"]);

let cachedCurriculum = null;
let cachedStorageFiles = null;
let storageFilesExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

function normalizedResourceText(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function resourceKey(value = "") {
  return normalizedResourceText(value).replace(/\s+/g, "-");
}

function parseTitleAuthorSegments(value = "") {
  const parts = String(value).split(/—|â€"/).map((p) => p.trim()).filter(Boolean);
  return { title: parts[0] || String(value).trim(), author: parts[1] || "", trailing: parts.slice(2) };
}

function parseSessionNumbers(value = "") {
  const matches = String(value).match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

function primaryTitle(value = "") {
  return String(value).split(":")[0].split(" - ")[0].trim();
}

function significantTokens(value = "") {
  return normalizedResourceText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function normalizeCrosswaySource(source, index) {
  if (source && typeof source === "object" && !Array.isArray(source)) {
    return {
      key: source.key || resourceKey(source.title || `source-${index}`),
      title: source.title || `Source ${index + 1}`,
      author: source.author || "",
      filePath: source.filePath || "",
      summary: source.summary || "",
      sessionNumbers: Array.isArray(source.sessionNumbers) ? source.sessionNumbers.map(Number) : [],
      notes: source.notes || "",
    };
  }
  const parsed = parseTitleAuthorSegments(source);
  const sessionSegment = [parsed.author, ...parsed.trailing].find((p) => /session/i.test(p)) || "";
  const author = sessionSegment && parsed.author === sessionSegment ? "" : parsed.author;
  return {
    key: resourceKey(parsed.title || `source-${index}`),
    title: parsed.title || `Source ${index + 1}`,
    author,
    filePath: "",
    summary: "",
    sessionNumbers: parseSessionNumbers(sessionSegment),
    notes: "",
  };
}

function normalizeCourseCollections(course) {
  course.readings = Array.isArray(course.readings) ? course.readings : [];
  course.crosswaySources = Array.isArray(course.crosswaySources) ? course.crosswaySources : [];
  course.personalLibrary = Array.isArray(course.personalLibrary) ? course.personalLibrary : [];
  return course;
}

function loadCurriculum() {
  if (cachedCurriculum) return cachedCurriculum;
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, "course-data.js"), "utf8"), sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, "course-lectures.js"), "utf8"), sandbox);
  cachedCurriculum = sandbox.window.SHEPHERD_CURRICULUM || { courses: [] };
  cachedCurriculum.courses = (cachedCurriculum.courses || []).map(normalizeCourseCollections);
  return cachedCurriculum;
}

function scorePdfCandidate(source, storagePath) {
  const haystack = normalizedResourceText(path.basename(storagePath, ".pdf"));
  const fullTitle = normalizedResourceText(source.title);
  const shortTitle = normalizedResourceText(primaryTitle(source.title));
  const titleTokens = significantTokens(source.title);
  if (!titleTokens.length) return 0;

  let score = titleTokens.filter((token) => haystack.includes(token)).length;
  if (shortTitle && haystack.includes(shortTitle)) score += 8;
  if (fullTitle && haystack.includes(fullTitle)) score += 10;
  if (source.author) {
    score += significantTokens(source.author).filter((token) => haystack.includes(token)).length;
  }
  return score;
}

async function listStorageFiles(prefix = "") {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix || undefined, { limit: 1000 });
  if (error || !data) return [];

  const files = [];
  await Promise.all(
    data.map(async (item) => {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        const subFiles = await listStorageFiles(itemPath);
        files.push(...subFiles);
      } else if (itemPath.toLowerCase().endsWith(".pdf")) {
        files.push(itemPath);
      }
    })
  );
  return files;
}

async function getStorageFiles() {
  const now = Date.now();
  if (cachedStorageFiles && now < storageFilesExpiry) return cachedStorageFiles;
  cachedStorageFiles = await listStorageFiles();
  storageFilesExpiry = now + CACHE_TTL_MS;
  return cachedStorageFiles;
}

function storagePublicUrl(filePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data?.publicUrl || "";
}

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const courseId = String(req.query.courseId || "");
  const curriculum = loadCurriculum();
  const course = curriculum.courses.find((c) => c.id === courseId);

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const allFiles = await getStorageFiles();
  const libraryReady = allFiles.length > 0;

  const sources = (course.crosswaySources || []).map((source, index) => {
    const normalized = normalizeCrosswaySource(source, index);

    if (normalized.filePath) {
      const exactMatch = allFiles.find(
        (f) => f === normalized.filePath || f.endsWith(normalized.filePath)
      );
      if (exactMatch) {
        return { ...normalized, linked: true, linkedState: "linked", pdfUrl: storagePublicUrl(exactMatch) };
      }
    }

    let bestPath = "";
    let bestScore = 0;
    for (const filePath of allFiles) {
      const score = scorePdfCandidate(normalized, filePath);
      if (score > bestScore) {
        bestScore = score;
        bestPath = filePath;
      }
    }

    if (bestScore >= 2) {
      return { ...normalized, linked: true, linkedState: "auto", pdfUrl: storagePublicUrl(bestPath) };
    }

    return { ...normalized, linked: false, linkedState: "missing", pdfUrl: "" };
  });

  res.status(200).json({
    courseId,
    libraryRoot: `Supabase Storage / ${BUCKET}`,
    libraryReady,
    sources,
  });
};
