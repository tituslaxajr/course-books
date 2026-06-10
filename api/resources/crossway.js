const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..", "..");

const STOP_WORDS = new Set(["the", "and", "for", "with", "from", "guide", "vol", "volume", "ed", "of", "to"]);

let cachedCurriculum = null;

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

  const sources = (course.crosswaySources || []).map((source, index) => {
    const normalized = normalizeCrosswaySource(source, index);
    // PDF serving requires local files and is not available in this deployment.
    // To enable PDFs, upload them to Supabase Storage and set pdfUrl accordingly.
    return { ...normalized, linked: false, linkedState: "missing", pdfUrl: "" };
  });

  res.status(200).json({
    courseId,
    libraryRoot: "",
    libraryReady: false,
    sources,
  });
};
