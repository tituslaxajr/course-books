const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const root = __dirname;
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "shepherds-curriculum.sqlite");
const port = Number(process.env.PORT || 4173);

fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS progress (
    course_id TEXT NOT NULL,
    session_number INTEGER NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id, session_number)
  );
  CREATE TABLE IF NOT EXISTS course_notes (
    course_id TEXT PRIMARY KEY,
    body TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS reading_reflections (
    course_id TEXT NOT NULL,
    session_number INTEGER NOT NULL,
    prompt_key TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id, session_number, prompt_key)
  );
  CREATE TABLE IF NOT EXISTS research_drafts (
    course_id TEXT NOT NULL,
    session_number INTEGER NOT NULL,
    task_key TEXT NOT NULL,
    task_text TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id, session_number, task_key)
  );
  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id TEXT NOT NULL,
    session_number INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const statements = {
  progressAll: db.prepare("SELECT * FROM progress"),
  notesAll: db.prepare("SELECT * FROM course_notes"),
  reflectionsAll: db.prepare("SELECT * FROM reading_reflections"),
  draftsAll: db.prepare("SELECT * FROM research_drafts"),
  quizAll: db.prepare("SELECT * FROM quiz_attempts ORDER BY created_at DESC, id DESC"),
  progressUpsert: db.prepare(`
    INSERT INTO progress (course_id, session_number, completed, completed_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(course_id, session_number) DO UPDATE SET
      completed = excluded.completed,
      completed_at = excluded.completed_at,
      updated_at = CURRENT_TIMESTAMP
  `),
  noteUpsert: db.prepare(`
    INSERT INTO course_notes (course_id, body, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(course_id) DO UPDATE SET body = excluded.body, updated_at = CURRENT_TIMESTAMP
  `),
  reflectionUpsert: db.prepare(`
    INSERT INTO reading_reflections (course_id, session_number, prompt_key, prompt_text, body, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(course_id, session_number, prompt_key) DO UPDATE SET
      prompt_text = excluded.prompt_text,
      body = excluded.body,
      updated_at = CURRENT_TIMESTAMP
  `),
  draftUpsert: db.prepare(`
    INSERT INTO research_drafts (course_id, session_number, task_key, task_text, title, body, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(course_id, session_number, task_key) DO UPDATE SET
      task_text = excluded.task_text,
      title = excluded.title,
      body = excluded.body,
      updated_at = CURRENT_TIMESTAMP
  `),
  quizInsert: db.prepare(`
    INSERT INTO quiz_attempts (course_id, session_number, score, total_questions, answers_json)
    VALUES (?, ?, ?, ?, ?)
  `),
};

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function notFound(response) {
  sendJson(response, 404, { error: "Not found" });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    request.on("error", reject);
  });
}

function studyData() {
  return {
    progress: statements.progressAll.all(),
    courseNotes: statements.notesAll.all(),
    reflections: statements.reflectionsAll.all(),
    drafts: statements.draftsAll.all(),
    quizAttempts: statements.quizAll.all().map((row) => ({
      ...row,
      answers: JSON.parse(row.answers_json || "[]"),
      answers_json: undefined,
    })),
  };
}

async function handleApi(request, response) {
  try {
    if (request.method === "GET" && request.url === "/api/study-data") {
      sendJson(response, 200, studyData());
      return;
    }

    const payload = await readBody(request);

    if (request.method === "POST" && request.url === "/api/progress") {
      const completed = payload.completed ? 1 : 0;
      statements.progressUpsert.run(
        String(payload.courseId || ""),
        Number(payload.sessionNumber),
        completed,
        completed ? new Date().toISOString() : null
      );
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && request.url === "/api/course-notes") {
      statements.noteUpsert.run(String(payload.courseId || ""), String(payload.body || ""));
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && request.url === "/api/reflections") {
      statements.reflectionUpsert.run(
        String(payload.courseId || ""),
        Number(payload.sessionNumber),
        String(payload.promptKey || ""),
        String(payload.promptText || ""),
        String(payload.body || "")
      );
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && request.url === "/api/research-drafts") {
      statements.draftUpsert.run(
        String(payload.courseId || ""),
        Number(payload.sessionNumber),
        String(payload.taskKey || ""),
        String(payload.taskText || ""),
        String(payload.title || ""),
        String(payload.body || "")
      );
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && request.url === "/api/quiz-attempts") {
      statements.quizInsert.run(
        String(payload.courseId || ""),
        Number(payload.sessionNumber),
        Number(payload.score || 0),
        Number(payload.totalQuestions || 0),
        JSON.stringify(payload.answers || [])
      );
      sendJson(response, 200, { ok: true, data: studyData().quizAttempts[0] });
      return;
    }

    notFound(response);
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

function serveFile(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname);
  const filePath = path.normalize(path.join(root, requestPath === "/" ? "index.html" : requestPath));
  if (!filePath.startsWith(root)) {
    notFound(response);
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (!path.extname(requestPath)) {
        fs.readFile(path.join(root, "index.html"), (indexError, indexContent) => {
          if (indexError) {
            notFound(response);
            return;
          }
          response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          response.end(indexContent);
        });
        return;
      }
      notFound(response);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml",
    }[ext] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": type });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  if (request.url.startsWith("/api/")) {
    handleApi(request, response);
    return;
  }
  serveFile(request, response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Shepherd's Curriculum running at http://127.0.0.1:${port}/`);
  console.log(`SQLite data file: ${dbPath}`);
});
