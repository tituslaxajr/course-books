const data = window.SHEPHERD_CURRICULUM;
const courses = data.courses;

courses.forEach((course) => {
  course.readings = Array.isArray(course.readings) ? course.readings : [];
  course.crosswaySources = Array.isArray(course.crosswaySources) ? course.crosswaySources : [];
  course.personalLibrary = Array.isArray(course.personalLibrary) ? course.personalLibrary : [];
});

const state = {
  selectedCourse: 0,
  view: "library",
  query: "",
  completed: loadState("shepherd-completed", {}),
  bookmarks: loadState("shepherd-bookmarks", {}),
  notes: loadState("shepherd-notes", {}),
  study: {
    reflections: {},
    drafts: {},
    quizAttempts: [],
  },
  resources: {
    byCourse: {},
    pending: {},
    activeSourceKey: "",
  },
  resourceFilter: "All Resources",
  bookmarkFilter: "All",
  databaseReady: false,
};

const appRoutes = {
  course: /^\/courses\/([^/]+)\/?$/,
  session: /^\/courses\/([^/]+)\/session-(\d+)\/?$/,
};

const icons = {
  "book-open": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H11v18H4.5A2.5 2.5 0 0 0 2 22V4.5Z"/><path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H13v18h6.5A2.5 2.5 0 0 1 22 22V4.5Z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 9 0 1 1-9-9v9h9Z"/><path d="M12 3a9 9 0 0 1 9 9"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>',
  "file-text": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6M8 9h2"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 3h12a1 1 0 0 1 1 1v18l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>',
  "arrow-up": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 19V5M5 12l7-7 7 7"/></svg>',
  "arrow-down": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 5v14M19 12l-7 7-7-7"/></svg>',
  "arrow-left": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 12H5M11 5l-7 7 7 7"/></svg>',
  "arrow-right": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
  "chevron-down": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 9 6 6 6-6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m20 6-11 11-5-5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6 6 18M6 6l12 12"/></svg>',
};

function loadState(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveState(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sessionPath(course, session) {
  return `/courses/${course.slug}/session-${session.number}`;
}

function coursePath(course) {
  return `/courses/${course.slug}`;
}

function findCourseBySlug(slug) {
  return courses.find((course) => course.slug === slug);
}

function routeForPath(pathname = window.location.pathname) {
  const sessionMatch = pathname.match(appRoutes.session);
  if (sessionMatch) {
    const course = findCourseBySlug(sessionMatch[1]);
    const session = course?.sessions.find((item) => item.number === Number(sessionMatch[2]));
    if (course && session) return { type: "session", course, session };
  }
  const courseMatch = pathname.match(appRoutes.course);
  if (courseMatch) {
    const course = findCourseBySlug(courseMatch[1]);
    if (course) return { type: "course", course };
  }
  return { type: "view", view: "library" };
}

function navigateTo(path) {
  if (window.location.pathname !== path) history.pushState({}, "", path);
  applyRoute(routeForPath(path));
}

function resetRouteScroll() {
  const jumpToTop = () => {
    document.querySelector(".active-view")?.scrollIntoView({ block: "start" });
    window.scrollTo(0, 0);
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };
  jumpToTop();
  window.requestAnimationFrame(jumpToTop);
  window.setTimeout(jumpToTop, 0);
  window.setTimeout(jumpToTop, 60);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return response.json();
}

function reflectionKey(course, session, index) {
  return `${course.id}:session-${session.number}:prompt-${index}`;
}

function draftKey(course, session, index) {
  return `${course.id}:session-${session.number}:task-${index}`;
}

function getReflection(course, session, index) {
  return state.study.reflections[reflectionKey(course, session, index)]?.body || "";
}

function getDraft(course, session, index) {
  return state.study.drafts[draftKey(course, session, index)] || { title: "", body: "" };
}

function latestQuizAttempt(course, session) {
  return state.study.quizAttempts.find(
    (attempt) => attempt.course_id === course.id && Number(attempt.session_number) === Number(session.number)
  );
}

function normalizeStudyData(payload) {
  const dbCompleted = {};
  payload.progress?.forEach((row) => {
    dbCompleted[`${row.course_id}:session-${row.session_number}`] = Boolean(row.completed);
  });

  const dbNotes = {};
  payload.courseNotes?.forEach((row) => {
    dbNotes[row.course_id] = row.body || "";
  });

  const reflections = {};
  payload.reflections?.forEach((row) => {
    reflections[`${row.course_id}:session-${row.session_number}:${row.prompt_key}`] = row;
  });

  const drafts = {};
  payload.drafts?.forEach((row) => {
    drafts[`${row.course_id}:session-${row.session_number}:${row.task_key}`] = row;
  });

  state.completed = { ...state.completed, ...dbCompleted };
  state.notes = { ...state.notes, ...dbNotes };
  state.study.reflections = reflections;
  state.study.drafts = drafts;
  state.study.quizAttempts = payload.quizAttempts || [];
  state.databaseReady = true;
}

async function loadStudyData() {
  try {
    const payload = await apiRequest("/api/study-data");
    normalizeStudyData(payload);
  } catch (error) {
    state.databaseReady = false;
    toast("Using browser storage until the local database server is running");
  }
}

function debounce(callback, delay = 500) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), delay);
  };
}

const autosaveField = debounce(async (field) => {
  const status = document.querySelector(`[data-save-status="${field.dataset.saveId}"]`);
  if (status) status.textContent = "Saving...";
  try {
    if (field.dataset.studyType === "course-note") {
      const course = courses.find((item) => item.id === field.dataset.courseId);
      state.notes[field.dataset.courseId] = field.value;
      saveState("shepherd-notes", state.notes);
      await apiRequest("/api/course-notes", {
        method: "POST",
        body: JSON.stringify({ courseId: course.id, body: field.value }),
      });
    }

    if (field.dataset.studyType === "reflection") {
      const course = courses.find((item) => item.id === field.dataset.courseId);
      const session = course.sessions.find((item) => item.number === Number(field.dataset.sessionNumber));
      const index = Number(field.dataset.index);
      const key = reflectionKey(course, session, index);
      const payload = {
        courseId: course.id,
        sessionNumber: session.number,
        promptKey: `prompt-${index}`,
        promptText: field.dataset.promptText || "",
        body: field.value,
      };
      state.study.reflections[key] = {
        course_id: course.id,
        session_number: session.number,
        prompt_key: payload.promptKey,
        prompt_text: payload.promptText,
        body: field.value,
      };
      await apiRequest("/api/reflections", { method: "POST", body: JSON.stringify(payload) });
    }

    if (field.dataset.studyType === "draft-body" || field.dataset.studyType === "draft-title") {
      const course = courses.find((item) => item.id === field.dataset.courseId);
      const session = course.sessions.find((item) => item.number === Number(field.dataset.sessionNumber));
      const index = Number(field.dataset.index);
      const title = document.querySelector(`[data-draft-title="${field.dataset.saveId}"]`)?.value || "";
      const body = document.querySelector(`[data-draft-body="${field.dataset.saveId}"]`)?.value || "";
      const key = draftKey(course, session, index);
      const payload = {
        courseId: course.id,
        sessionNumber: session.number,
        taskKey: `task-${index}`,
        taskText: field.dataset.taskText || "",
        title,
        body,
      };
      state.study.drafts[key] = {
        course_id: course.id,
        session_number: session.number,
        task_key: payload.taskKey,
        task_text: payload.taskText,
        title,
        body,
      };
      await apiRequest("/api/research-drafts", { method: "POST", body: JSON.stringify(payload) });
    }

    if (status) status.textContent = "Saved";
    renderSupplementalViews();
  } catch {
    if (status) status.textContent = "Not saved";
  }
});

function $(selector) {
  return document.querySelector(selector);
}

function renderIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((node) => {
    const name = node.dataset.icon;
    node.innerHTML = icons[name] || "";
  });
}

function currentCourse() {
  return courses[state.selectedCourse];
}

function normalizedResourceText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resourceKey(value = "") {
  return normalizedResourceText(value).replace(/\s+/g, "-");
}

function parseTitleAuthorSegments(value = "") {
  const parts = String(value)
    .split(/—|â€”/)
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    title: parts[0] || String(value).trim(),
    author: parts[1] || "",
    trailing: parts.slice(2),
  };
}

function parseSessionNumbers(value = "") {
  const matches = String(value).match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

function normalizeReadingEntry(reading, index = 0) {
  if (reading && typeof reading === "object" && !Array.isArray(reading)) {
    return {
      key: reading.key || resourceKey(reading.title || `reading-${index}`),
      title: reading.title || `Reading ${index + 1}`,
      author: reading.author || "",
      isbn: reading.isbn || "",
      coverUrl: reading.coverUrl || "",
      publisher: reading.publisher || "",
      year: reading.year || "",
      notes: reading.notes || "",
    };
  }

  const parsed = parseTitleAuthorSegments(reading);
  return {
    key: resourceKey(parsed.title || `reading-${index}`),
    title: parsed.title || `Reading ${index + 1}`,
    author: parsed.author || "",
    isbn: "",
    coverUrl: "",
    publisher: "",
    year: "",
    notes: "",
  };
}

function normalizeCrosswaySourceEntry(source, index = 0) {
  if (source && typeof source === "object" && !Array.isArray(source)) {
    return {
      key: source.key || resourceKey(source.title || `source-${index}`),
      title: source.title || `Source ${index + 1}`,
      author: source.author || "",
      filePath: source.filePath || "",
      pdfUrl: source.pdfUrl || "",
      linked: Boolean(source.linked || source.filePath || source.pdfUrl),
      linkedState: source.linkedState || (source.linked || source.filePath || source.pdfUrl ? "linked" : "missing"),
      summary: source.summary || "",
      sessionNumbers: Array.isArray(source.sessionNumbers) ? source.sessionNumbers.map(Number) : [],
      notes: source.notes || "",
    };
  }

  const parsed = parseTitleAuthorSegments(source);
  const sessionSegment = [parsed.author, ...parsed.trailing].find((part) => /session/i.test(part)) || "";
  const author = sessionSegment && parsed.author === sessionSegment ? "" : parsed.author;
  return {
    key: resourceKey(parsed.title || `source-${index}`),
    title: parsed.title || `Source ${index + 1}`,
    author,
    filePath: "",
    pdfUrl: "",
    linked: false,
    linkedState: "missing",
    summary: "",
    sessionNumbers: parseSessionNumbers(sessionSegment),
    notes: "",
  };
}

function normalizedReadingsForCourse(course) {
  return (course.readings || []).map((reading, index) => normalizeReadingEntry(reading, index));
}

function normalizedCrosswaySourcesForCourse(course) {
  return (course.crosswaySources || []).map((source, index) => normalizeCrosswaySourceEntry(source, index));
}

function glossaryTermsForCourse(course) {
  const seen = new Set();
  return course.sessions
    .flatMap((session) => session.appendixTerms || [])
    .filter((item) => {
      const key = `${item.term}::${item.definition}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function glossaryGridMarkup(terms, emptyTitle = "No glossary terms yet", emptyBody = "This course does not have a compiled glossary entry yet.") {
  if (!terms.length) {
    return `<article class="note-card"><strong>${emptyTitle}</strong><small>${emptyBody}</small></article>`;
  }
  return `
    <div class="term-grid">
      ${terms
        .map((item) => `
          <article class="term-card">
            <strong>${escapeHtml(item.term)}</strong>
            <small>${escapeHtml(item.definition)}</small>
          </article>
        `)
        .join("")}
    </div>
  `;
}

function glossaryTermsEqual(left = [], right = []) {
  if (left.length !== right.length) return false;
  const rightKeys = new Set(right.map((item) => `${item.term}::${item.definition}`));
  return left.every((item) => rightKeys.has(`${item.term}::${item.definition}`));
}

function sessionGlossaryConfig(course, session) {
  const courseGlossary = glossaryTermsForCourse(course);
  const appendixTerms = session.appendixTerms || [];
  if (appendixTerms.length && !glossaryTermsEqual(appendixTerms, courseGlossary)) {
    return { navLabel: "Appendix", title: "Session Appendix", terms: appendixTerms };
  }
  const terms = appendixTerms.length ? appendixTerms : courseGlossary;
  if (!terms.length) return null;
  return { navLabel: "Glossary", title: "Course Glossary", terms };
}

function sessionGlossarySectionMarkup(course, session) {
  const glossary = sessionGlossaryConfig(course, session);
  if (!glossary) return "";
  return `
    <section id="session-glossary" class="detail-section lecture-reader">
      <div class="section-heading"><span>${glossary.title}</span><strong>${glossary.terms.length} terms</strong></div>
      ${glossaryGridMarkup(glossary.terms)}
    </section>
  `;
}

function readingCoverUrl(reading) {
  if (reading.coverUrl) return reading.coverUrl;
  if (reading.isbn) return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(reading.isbn)}-L.jpg`;
  return "";
}

function readingsCount(course) {
  return normalizedReadingsForCourse(course).length;
}

function resourceSearchText(entry) {
  return [
    entry.title,
    entry.author,
    entry.publisher,
    entry.year,
    entry.notes,
    entry.summary,
    ...(entry.sessionNumbers || []).map(String),
  ].join(" ");
}

function courseCrosswayResources(course) {
  const cached = state.resources.byCourse[course.id];
  return cached?.sources || normalizedCrosswaySourcesForCourse(course);
}

async function ensureCrosswayResources(course = currentCourse()) {
  if (!course || state.resources.pending[course.id]) return;
  if (state.resources.byCourse[course.id]?.loaded) return;

  state.resources.pending[course.id] = true;
  try {
    const payload = await apiRequest(`/api/resources/crossway?courseId=${encodeURIComponent(course.id)}`);
    state.resources.byCourse[course.id] = {
      loaded: true,
      libraryReady: Boolean(payload.libraryReady),
      libraryRoot: payload.libraryRoot || "",
      sources: (payload.sources || []).map((source, index) => normalizeCrosswaySourceEntry(source, index)),
    };
  } catch {
    state.resources.byCourse[course.id] = {
      loaded: true,
      libraryReady: false,
      libraryRoot: "",
      sources: normalizedCrosswaySourcesForCourse(course),
    };
  } finally {
    state.resources.pending[course.id] = false;
    if (state.view === "resources" || state.resources.activeSourceKey) {
      renderResourcesPage();
      renderResourcesPageRedesign();
      renderResourceModal();
      renderIcons();
    }
  }
}

function activeResourceSource() {
  const course = currentCourse();
  return courseCrosswayResources(course).find((source) => source.key === state.resources.activeSourceKey) || null;
}

function openResourceModal(sourceKey) {
  state.resources.activeSourceKey = sourceKey;
  renderResourceModal();
}

function closeResourceModal() {
  state.resources.activeSourceKey = "";
  const dialog = $("#resourceModal");
  if (dialog?.open) dialog.close();
}

function renderResourceModal() {
  const dialog = $("#resourceModal");
  const content = $("#resourceModalContent");
  if (!dialog || !content) return;

  const course = currentCourse();
  const source = activeResourceSource();
  if (!source) {
    if (dialog.open) dialog.close();
    content.innerHTML = "";
    return;
  }

  const linkedSessions = source.sessionNumbers
    .map((sessionNumber) => course.sessions.find((item) => item.number === Number(sessionNumber)))
    .filter(Boolean);

  content.innerHTML = `
    <div class="resource-modal-head">
      <div>
        <span class="detail-kicker">Crossway Library Source</span>
        <h2>${escapeHtml(source.title)}</h2>
      </div>
      <button class="icon-button close-dialog" type="button" data-close-resource-modal aria-label="Close resource reader">
        <span data-icon="x"></span>
      </button>
    </div>
    <div class="resource-modal-meta">
      <span class="dashboard-meta-pill">${source.author ? escapeHtml(source.author) : "Author not listed"}</span>
      <span class="dashboard-meta-pill">${source.linkedState === "linked" ? "Linked PDF" : source.linkedState === "auto" ? "Auto-matched PDF" : "PDF not linked"}</span>
      ${
        linkedSessions.length
          ? linkedSessions
              .map(
                (session) =>
                  `<button class="secondary-action resource-session-chip" type="button" data-session="${session.number}">Session ${session.number}</button>`
              )
              .join("")
          : ""
      }
    </div>
    <p class="resource-modal-copy">${escapeHtml(source.summary || source.notes || "This source is available for lecture support and reference inside the selected course.")}</p>
    ${
      source.linked && source.pdfUrl
        ? `
          <div class="resource-modal-actions">
            <a class="secondary-action" href="${escapeHtml(source.pdfUrl)}" target="_blank" rel="noreferrer">
              <span data-icon="download"></span>
              <span>Open PDF</span>
            </a>
          </div>
          <div class="resource-pdf-frame">
            <iframe src="${escapeHtml(`${source.pdfUrl}#view=FitH`)}" title="${escapeHtml(source.title)} PDF"></iframe>
          </div>
        `
        : `
          <div class="resource-empty-state">
            <strong>PDF not linked yet</strong>
            <small>This title is visible in Resources, but it still needs an explicit file path or a valid library match before it can open inline.</small>
          </div>
        `
    }
  `;

  renderIcons(dialog);
  if (!dialog.open) dialog.showModal();
}

function sessionKey(course, session) {
  return `${course.id}:session-${session.number}`;
}

function courseProgress(course) {
  const done = course.sessions.filter((session) => state.completed[sessionKey(course, session)]).length;
  return Math.round((done / course.sessions.length) * 100);
}

function completedSessionCount(course) {
  return course.sessions.filter((session) => state.completed[sessionKey(course, session)]).length;
}

function allCompletedSessions() {
  return courses.flatMap((course) =>
    course.sessions
      .filter((session) => state.completed[sessionKey(course, session)])
      .map((session) => ({ course, session }))
  );
}

function nextSessionForCourse(course) {
  return course.sessions.find((session) => !state.completed[sessionKey(course, session)]) || course.sessions[0];
}

function memoryLine(session) {
  return session.reflection.find((line) => line.startsWith("Memorize:")) || "Scripture memory assigned in reflection";
}

function plainTextFromHtml(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizedText(value = "") {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function searchTerms(query = state.query) {
  return normalizedText(query).split(" ").filter(Boolean);
}

function includesTerms(haystack, query = state.query) {
  const terms = searchTerms(query);
  if (!terms.length) return true;
  const text = normalizedText(haystack);
  return terms.every((term) => text.includes(term));
}

function searchScore(haystack, query = state.query) {
  const terms = searchTerms(query);
  if (!terms.length) return 0;
  const text = normalizedText(haystack);
  return terms.reduce((score, term) => {
    let index = text.indexOf(term);
    let matches = 0;
    while (index !== -1) {
      matches += 1;
      index = text.indexOf(term, index + term.length);
    }
    return score + matches;
  }, 0);
}

function sessionSearchText(course, session) {
  const savedReflections = Object.values(state.study.reflections)
    .filter((item) => item.course_id === course.id && Number(item.session_number) === session.number)
    .flatMap((item) => [item.prompt_text, item.body]);
  const savedDrafts = Object.values(state.study.drafts)
    .filter((item) => item.course_id === course.id && Number(item.session_number) === session.number)
    .flatMap((item) => [item.task_text, item.title, item.body]);
  const savedQuizzes = state.study.quizAttempts
    .filter((item) => item.course_id === course.id && Number(item.session_number) === session.number)
    .flatMap((item) => [
      `${item.score}/${item.total_questions}`,
      ...(item.answers || []).flatMap((answer) => [answer.prompt, String(answer.selectedIndex), String(answer.correct)]),
    ]);
  return [
    course.title,
    course.description,
    course.category,
    session.title,
    session.keyVerse || "",
    session.lectureSources || "",
    session.fullText || "",
    plainTextFromHtml(session.lectureHtml || ""),
    plainTextFromHtml(session.reflectionHtml || ""),
    plainTextFromHtml(session.labHtml || ""),
    ...(session.appendixTerms || []).flatMap((term) => [term.term, term.definition]),
    ...(session.reflectionPrompts || []),
    ...(session.researchTasks || []),
    ...savedReflections,
    ...savedDrafts,
    ...savedQuizzes,
    ...session.lecture,
    ...session.reflection,
    ...session.lab,
  ].join(" ");
}

function matchingSessions(query = state.query) {
  if (!query) return currentCourse().sessions.map((session) => ({ course: currentCourse(), session }));
  return courses
    .flatMap((course) =>
      course.sessions
        .map((session) => ({ course, session, score: searchScore(sessionSearchText(course, session), query) }))
        .filter((item) => item.score > 0 && includesTerms(sessionSearchText(item.course, item.session), query))
    )
    .sort((a, b) => b.score - a.score || a.course.number - b.course.number || a.session.number - b.session.number)
    .map(({ course, session }) => ({ course, session }));
}

function matchingCourses(query = state.query) {
  if (!query) return courses;
  return courses
    .map((course) => {
      const ownScore = searchScore(
        [
          course.title,
          course.description,
          course.category,
          ...course.objectives,
          ...normalizedReadingsForCourse(course).map((item) => resourceSearchText(item)),
          ...normalizedCrosswaySourcesForCourse(course).map((item) => resourceSearchText(item)),
          ...(course.personalLibrary || []),
          state.notes[course.id] || "",
        ].join(" "),
        query
      );
      const sessionScore = course.sessions.reduce((best, session) => Math.max(best, searchScore(sessionSearchText(course, session), query)), 0);
      return { course, score: ownScore + sessionScore };
    })
    .filter(({ course, score }) => score > 0 && courseMatches(course, query))
    .sort((a, b) => b.score - a.score || a.course.number - b.course.number)
    .map(({ course }) => course);
}

function primarySearchResult(query = state.query) {
  if (!query) return null;
  const sessionMatches = matchingSessions(query);
  if (sessionMatches.length) return sessionMatches[0];
  const course = matchingCourses(query)[0];
  return course ? { course, session: nextSessionForCourse(course) || course.sessions[0] } : null;
}

function searchSnippet(course, session, query = state.query) {
  const text = sessionSearchText(course, session).replace(/\s+/g, " ").trim();
  const terms = searchTerms(query);
  const firstIndex = terms.reduce((best, term) => {
    const index = normalizedText(text).indexOf(term);
    return index === -1 ? best : Math.min(best, index);
  }, Number.POSITIVE_INFINITY);
  if (!Number.isFinite(firstIndex)) return session.lecture[0] || course.description;
  const start = Math.max(0, firstIndex - 70);
  const end = Math.min(text.length, firstIndex + 210);
  return `${start > 0 ? "..." : ""}${text.slice(start, end)}${end < text.length ? "..." : ""}`;
}

function lectureHeadingLabel(value = "") {
  return String(value)
    .replace(/^\d+\.\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function lectureSentenceSnippet(value = "", fallback = "") {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  const firstSentence = text.match(/(.+?[.!?])(\s|$)/)?.[1] || text;
  return firstSentence.length > 180 ? `${firstSentence.slice(0, 177).trim()}...` : firstSentence;
}

function parseLectureSources(value = "") {
  return String(value)
    .split(";")
    .map((item) => item.replace(/\*/g, "").trim())
    .filter(Boolean)
    .map((item) => {
      const match = item.match(/^(.*?)\s+(?:—|â€”|-)\s+(.*)$/);
      if (!match) return { title: item, detail: "" };
      return { title: match[1].trim(), detail: match[2].trim() };
    });
}

function lectureOverviewMarkup(session, glossaryCount = 0) {
  const sections = session.lectureSections || [];
  const sources = parseLectureSources(session.lectureSources || "");
  const focusCards = sections.slice(0, 3);
  const doctrinalLabels = sections.slice(0, 6).map((section) => lectureHeadingLabel(section.heading));
  const keyVerseText = session.keyVerse ? session.keyVerse.replace(/^["']|["']$/g, "").trim() : "Key verse assigned in the session header";

  return `
    <section class="lecture-atlas">
      <div class="section-heading lecture-atlas-head">
        <span>Overview</span>
        <strong>Map and sources</strong>
      </div>
      <div class="lecture-atlas-strip">
        ${dashboardMetricMarkup("Sections", sections.length, "doctrinal movements")}
        ${dashboardMetricMarkup("Sources", sources.length || 1, "guided readings")}
        ${dashboardMetricMarkup("Terms", glossaryCount, glossaryCount ? "reference terms" : "no glossary terms")}
      </div>
      <div class="lecture-atlas-grid">
        <article class="lecture-map-card">
          <span class="detail-kicker">Concept Flow</span>
          <strong>How the argument moves</strong>
          <div class="lecture-flow">
            ${doctrinalLabels
              .map(
                (label, index) => `
                  <div class="lecture-flow-step">
                    <span class="lecture-flow-index">${index + 1}</span>
                    <div>
                      <strong>${escapeHtml(label)}</strong>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
        <article class="lecture-map-card">
          <span class="detail-kicker">Source Shelf</span>
          <strong>Assigned voices for this lecture</strong>
          <div class="lecture-source-list">
            ${sources
              .map(
                (source) => `
                  <article class="lecture-source-item">
                    <strong>${escapeHtml(source.title)}</strong>
                    <small>${escapeHtml(source.detail || "Assigned reading for this lecture")}</small>
                  </article>
                `
              )
              .join("")}
          </div>
          <div class="lecture-verse-card">
            <span class="detail-kicker">Key Verse</span>
            <p>${escapeHtml(keyVerseText)}</p>
          </div>
        </article>
      </div>
      <div class="lecture-focus-grid">
        ${focusCards
          .map(
            (section, index) => `
              <article class="lecture-focus-card">
                <span class="lecture-flow-index">${index + 1}</span>
                <strong>${escapeHtml(lectureHeadingLabel(section.heading))}</strong>
                <p>${escapeHtml(lectureSentenceSnippet(section.plainText, "Open the section below for the full explanation."))}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function courseStudyStats(course) {
  const completed = completedSessionCount(course);
  const reflections = Object.values(state.study.reflections).filter((item) => item.course_id === course.id && item.body?.trim()).length;
  const drafts = Object.values(state.study.drafts).filter((item) => item.course_id === course.id && (item.title?.trim() || item.body?.trim())).length;
  const quizzes = state.study.quizAttempts.filter((item) => item.course_id === course.id);
  const latestQuiz = quizzes[0];
  return { completed, reflections, drafts, quizzes: quizzes.length, latestQuiz };
}

function wordCount(value = "") {
  const text = String(value).trim();
  return text ? text.split(/\s+/).length : 0;
}

function bookmarkedCourseSelection(bookmarked) {
  if (!bookmarked.length) return null;
  return bookmarked.find((course) => course.id === currentCourse().id) || bookmarked[0];
}

function dashboardMetricMarkup(label, value, detail) {
  return `
    <article class="metric-card metric-card-compact">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${detail}</small>
    </article>
  `;
}

function dashboardFocusPanel({ kicker, title, description, metaItems = [], asideValue, asideLabel, ctaMarkup = "" }) {
  return `
    <section class="dashboard-focus-panel">
      <div class="dashboard-focus-copy">
        <span class="detail-kicker">${kicker}</span>
        <h3>${title}</h3>
        <p>${description}</p>
        ${
          metaItems.length
            ? `
              <div class="dashboard-meta-list">
                ${metaItems.map((item) => `<span class="dashboard-meta-pill">${item}</span>`).join("")}
              </div>
            `
            : ""
        }
        ${ctaMarkup ? `<div class="dashboard-focus-actions">${ctaMarkup}</div>` : ""}
      </div>
      <div class="dashboard-focus-aside">
        <strong>${asideValue}</strong>
        <small>${asideLabel}</small>
      </div>
    </section>
  `;
}

function greetingLabel() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function preparedForName() {
  return data.preparedFor || "Pastor";
}

function preparedForShortName() {
  const name = preparedForName();
  return name.split(/\s+/)[0] || name;
}

function currentHeroTitle(searchMode, query) {
  return searchMode ? `Results for "${query}"` : `${greetingLabel()}, ${preparedForShortName()}`;
}

function courseLibrarySelection(filteredCourses) {
  if (state.query) return filteredCourses.slice(0, 4);
  const selectedCourse = currentCourse();
  return [selectedCourse, ...courses.filter((course) => course.id !== selectedCourse.id)].slice(0, 4);
}

function notePreview(value = "", limit = 120) {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit - 3).trim()}...` : text;
}

function libraryUpcomingSessions(course, limit = 2) {
  const pending = course.sessions.filter((session) => !state.completed[sessionKey(course, session)]);
  return (pending.length ? pending : course.sessions).slice(0, limit);
}

function librarySavedNotesMarkup(course, focusCourse, focusSession, filteredCourses, filteredSessions) {
  if (state.query) {
    return `
      <article class="saved-note-card saved-note-card-search">
        <span class="saved-note-icon" data-icon="search"></span>
        <div>
          <strong>${filteredCourses.length} course${filteredCourses.length === 1 ? "" : "s"} matched</strong>
          <small>${filteredSessions.length} session${filteredSessions.length === 1 ? "" : "s"} found across the curriculum.</small>
        </div>
      </article>
      <article class="saved-note-card">
        <span class="saved-note-icon" data-icon="book-open"></span>
        <div>
          <strong>${escapeHtml(focusCourse?.title || "No course match yet")}</strong>
          <small>${focusSession ? `Best session match: ${escapeHtml(focusSession.title)}` : "Try a doctrine, Scripture reference, or reading title."}</small>
        </div>
      </article>
    `;
  }

  const notedCourses = courses.filter((item) => state.notes[item.id]?.trim());
  const bookmarked = courses.filter((item) => state.bookmarks[item.id]);
  const items = [];

  if (state.notes[course.id]?.trim()) {
    items.push({
      icon: "file-text",
      title: "Course notebook",
      detail: notePreview(state.notes[course.id]),
    });
  }

  const otherNotedCourse = notedCourses.find((item) => item.id !== course.id);
  if (otherNotedCourse) {
    items.push({
      icon: "bookmark",
      title: otherNotedCourse.title,
      detail: notePreview(state.notes[otherNotedCourse.id]),
    });
  }

  items.push({
    icon: "folder",
    title: bookmarked.length ? `${bookmarked.length} saved course${bookmarked.length === 1 ? "" : "s"}` : "No saved courses yet",
    detail: bookmarked.length
      ? "Bookmarks stay ready for mentoring, lesson planning, and review."
      : "Use the bookmark button on a featured course to save it here.",
  });

  return items
    .slice(0, 3)
    .map(
      (item) => `
        <article class="saved-note-card">
          <span class="saved-note-icon" data-icon="${item.icon}"></span>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.detail)}</small>
          </div>
        </article>
      `
    )
    .join("");
}

function libraryReadingMarkup(course, focusSession) {
  const session = focusSession || nextSessionForCourse(course) || course.sessions[0];
  return `
    <article class="reading-card">
      <p>${escapeHtml(session?.keyVerse || "Open the next session to bring the assigned key verse into view.")}</p>
      <strong>${escapeHtml(session ? memoryLine(session) : "Daily reading")}</strong>
    </article>
  `;
}

function libraryGoalMarkup(course, searchMode, filteredSessions) {
  if (searchMode) {
    return `
      <article class="goal-card">
        <div class="goal-row">
          <span class="goal-icon" data-icon="search"></span>
          <div>
            <strong>Search the whole library</strong>
            <small>${filteredSessions.length} session${filteredSessions.length === 1 ? "" : "s"} currently match your query.</small>
          </div>
        </div>
      </article>
    `;
  }

  const goalTarget = 3;
  const completed = Math.min(goalTarget, completedSessionCount(course));
  const percent = Math.round((completed / goalTarget) * 100);
  return `
    <article class="goal-card">
      <div class="goal-row">
        <span class="goal-icon" data-icon="chart"></span>
        <div>
          <strong>Study ${goalTarget} sessions</strong>
          <small>${completed} of ${goalTarget} completed in the current focus course.</small>
        </div>
        <strong class="goal-count">${completed} / ${goalTarget}</strong>
      </div>
      <div class="progress-bar progress-bar-goal"><span style="width:${percent}%"></span></div>
    </article>
  `;
}

function courseDisplayParts(course) {
  const title = String(course.title || "");
  const parts = title.split(/\s+(?:-|â€”|—)\s+/);
  return {
    title: parts[0] || title,
    subtitle: parts.slice(1).join(" - ") || course.category || course.level || "Course",
  };
}

function coverTone(course) {
  const tones = ["linen", "forest", "sand", "ochre", "sage", "clay", "stone", "slate", "blue", "charcoal"];
  return tones[(Number(course.number) - 1) % tones.length];
}

function bookCoverMarkup(course, { completed = false, compact = false } = {}) {
  const parts = courseDisplayParts(course);
  return `
    <div class="book-cover book-cover-${coverTone(course)} ${completed ? "is-completed" : ""} ${compact ? "is-compact" : ""}">
      <span class="book-course-number">Course ${String(course.number).padStart(2, "0")}</span>
      <strong>${escapeHtml(parts.title)}</strong>
      <small>${escapeHtml(parts.subtitle)}</small>
      <span class="book-emblem" aria-hidden="true"></span>
      ${completed ? `<span class="book-complete-mark" data-icon="check"></span>` : ""}
    </div>
  `;
}

function courseBookMarkup(course, { completed = false, compact = false } = {}) {
  const progress = courseProgress(course);
  return `
    <article class="shelf-book ${completed ? "is-completed" : ""}" data-course-route="${coursePath(course)}" data-course="${courses.indexOf(course)}">
      ${bookCoverMarkup(course, { completed, compact })}
      ${!completed ? `<div class="shelf-progress"><span style="width:${progress}%"></span></div><small>${progress}%</small>` : ""}
    </article>
  `;
}

function shelfSlice(start, count, source = courses) {
  if (source.length <= count) return source;
  return Array.from({ length: count }, (_, offset) => source[(start + offset) % source.length]);
}

function selectedCourseButton(course) {
  return `
    <button class="course-row ${course === currentCourse() ? "active" : ""}" data-select-course="${courses.indexOf(course)}">
      <span class="course-number">${String(course.number).padStart(2, "0")}</span>
      <span>
        <strong>${course.title}</strong>
        <small>${course.description}</small>
        <small class="course-category-label">${escapeHtml(course.category)}</small>
      </span>
      <span class="progress-pill">${courseProgress(course)}%</span>
    </button>
  `;
}

function courseRoadmapSessions(course) {
  const next = nextSessionForCourse(course);
  return course.sessions.map((session, index) => {
    const done = Boolean(state.completed[sessionKey(course, session)]);
    const isNext = next.number === session.number && !done;
    return {
      course,
      session,
      done,
      isNext,
      mobileOrder: isNext ? 0 : done ? index + 2 : index + 1,
    };
  });
}

function courseSupportMarkup(course) {
  const stats = courseStudyStats(course);
  const next = nextSessionForCourse(course);
  const readings = normalizedReadingsForCourse(course);
  const memoryItems = course.sessions
    .map((session) => `<li><strong>Session ${session.number}</strong><span>${escapeHtml(memoryLine(session))}</span></li>`)
    .join("");
  const savedCount = stats.reflections + stats.drafts + stats.quizzes;
  const resourceCount = courseCrosswayResources(course).length + (course.personalLibrary || []).length;

  return `
    <article class="support-card">
      <div class="support-card-head">
        <span class="detail-kicker">Study Work</span>
        <span class="progress-pill">${courseProgress(course)}%</span>
      </div>
      <strong>Progress and saved work</strong>
      <p>${stats.completed}/${course.sessions.length} sessions complete with ${savedCount} saved study item${savedCount === 1 ? "" : "s"} across notes, drafts, and quizzes.</p>
      <div class="support-meta">
        <span class="tag">Next: Session ${next.number}</span>
        <span class="tag">${stats.reflections} reflections</span>
        <span class="tag">${stats.drafts} drafts</span>
      </div>
    </article>
    <article class="support-card">
      <div class="support-card-head">
        <span class="detail-kicker">Readings</span>
        <span class="tag">${readings.length} assigned</span>
      </div>
      <strong>Reading shelf</strong>
      <ul class="support-list">
        ${
          readings.length
            ? readings
                .slice(0, 4)
                .map((item) => `<li>${escapeHtml(item.title)}${item.author ? `<span>${escapeHtml(item.author)}</span>` : ""}</li>`)
                .join("")
            : "<li>No reading entries yet</li>"
        }
      </ul>
    </article>
    <article class="support-card">
      <div class="support-card-head">
        <span class="detail-kicker">Memory</span>
        <span class="tag">${course.sessions.length} passages</span>
      </div>
      <strong>Session memory cues</strong>
      <ul class="memory-list">
        ${memoryItems}
      </ul>
    </article>
    <article class="support-card">
      <div class="support-card-head">
        <span class="detail-kicker">Resources</span>
        <span class="tag">${resourceCount} linked</span>
      </div>
      <strong>Reference shelf</strong>
      <p>${course.description}</p>
      <div class="support-actions">
        <button class="secondary-action" type="button" data-view="resources">
          <span>Open Resources</span>
          <span data-icon="arrow-right"></span>
        </button>
      </div>
    </article>
  `;
}

function searchSupportMarkup(query, filteredCourses, filteredSessions, focusCourse, focusSession) {
  return `
    <article class="support-card">
      <div class="support-card-head">
        <span class="detail-kicker">Best Match</span>
        <span class="tag">${filteredSessions.length} sessions</span>
      </div>
      <strong>${focusCourse ? escapeHtml(focusCourse.title) : "No course match yet"}</strong>
      <p>${
        focusSession
          ? `Session ${focusSession.number}: ${escapeHtml(focusSession.title)}`
          : `No session matched "${escapeHtml(query)}".`
      }</p>
      ${
        focusCourse && focusSession
          ? `
            <div class="support-actions">
              <button class="primary-action" type="button" data-session-route="${sessionPath(focusCourse, focusSession)}">
                <span>Open Best Match</span>
                <span data-icon="arrow-right"></span>
              </button>
            </div>
          `
          : ""
      }
    </article>
    <article class="support-card support-card-compact">
      <span class="detail-kicker">Courses</span>
      <strong>${filteredCourses.length}</strong>
      <p>Matched your query across the curriculum library.</p>
    </article>
    <article class="support-card support-card-compact">
      <span class="detail-kicker">Sessions</span>
      <strong>${filteredSessions.length}</strong>
      <p>Full-text matches from lectures, prompts, notes, and readings.</p>
    </article>
    <article class="support-card support-card-compact">
      <span class="detail-kicker">Scope</span>
      <strong>Curriculum</strong>
      <p>Search checks course descriptions, session content, resources, and saved study work.</p>
    </article>
  `;
}

function renderCourse() {
  const course = currentCourse();
  const query = state.query;
  const filteredCourses = matchingCourses(query);
  const filteredSessions = matchingSessions(query);
  const searchMode = Boolean(query);
  const searchResult = searchMode ? primarySearchResult(query) : null;
  const focusCourse = searchResult?.course || course;
  const focusSession = searchResult?.session || nextSessionForCourse(course) || course.sessions[0];
  const glossaryCourse = searchMode ? focusCourse : course;
  const courseStats = courseStudyStats(course);
  const next = nextSessionForCourse(course);

  $("#courseEyebrow").textContent = searchMode ? "Search Results" : `Course ${course.number} of ${courses.length}`;
  $("#courseTitle").textContent = currentHeroTitle(searchMode, query);
  $("#courseDescription").textContent = searchMode
    ? filteredSessions.length
      ? `${filteredSessions.length} matching session${filteredSessions.length === 1 ? "" : "s"} across ${filteredCourses.length} course${
          filteredCourses.length === 1 ? "" : "s"
        }. Open the best match directly or scan the filtered library below.`
      : `No matching sessions or courses found for "${query}". Try a doctrine, Scripture reference, lecture term, or reading title.`
    : "Equip your mind. Strengthen your ministry. Continue growing in the truth of God's Word through the current course focus.";
  $("#courseAbout").textContent = searchMode ? focusCourse.title : course.title;
  $("#featuredSummary").textContent = searchMode
    ? filteredSessions.length
      ? `Top match: Session ${focusSession.number} - ${focusSession.title}. Search covers lecture notes, reflection prompts, research tasks, readings, Crossway sources, Scripture references, glossary terms, and saved study work.`
      : "Search checks the full curriculum, including lecture notes, readings, study prompts, Crossway sources, and saved study work."
    : "Continue with the current doctrinal track through guided sessions, readings, reflection prompts, Scripture memory, and pastoral application.";
  $("#factSessions").textContent = searchMode ? `${filteredSessions.length} matches` : `${courseStats.completed}/${course.sessions.length} sessions`;
  $("#factLevel").textContent = searchMode ? `${filteredCourses.length} courses` : course.level;
  $("#factFormat").textContent = searchMode ? `Session ${focusSession.number}` : `Session ${next.number}: ${next.title}`;
  $("#factTime").textContent = searchMode ? (focusCourse?.estimatedTime || "Curriculum-wide") : course.estimatedTime;
  $("#factCategory").textContent = searchMode ? (focusCourse?.category || "Search") : course.category;
  $("#factReadings").textContent = searchMode ? `${filteredCourses.reduce((sum, item) => sum + readingsCount(item), 0)} books` : `${readingsCount(course)} books`;
  $("#featuredProgressValue").textContent = searchMode ? `${filteredSessions.length}` : `${courseProgress(course)}%`;
  $("#featuredProgressLabel").textContent = searchMode ? "matching sessions" : "current progress";
  $("#featuredProgressBar").style.width = `${searchMode ? Math.min(100, filteredSessions.length * 12) : courseProgress(course)}%`;
  $("#sessionHeading").textContent = searchMode ? "Matching Sessions" : "Upcoming Sessions";
  $("#supportHeading").textContent = searchMode ? "Search Summary" : "Saved & Notes";
  $("#courseListHeading").textContent = searchMode ? "Matching Courses" : "Course Library";
  $("#supportCount").textContent = searchMode ? "Summary" : "View all";
  $("#sessionCount").textContent = searchMode
    ? `${filteredSessions.length} matching session${filteredSessions.length === 1 ? "" : "s"}`
    : `${libraryUpcomingSessions(course, 2).length} queued`;

  $("#continueCourse span:first-child").textContent = searchMode ? "Open Best Match" : "Continue Course";
  $("#bookmarkCourse").classList.toggle("active", Boolean(state.bookmarks[course.id]));
  $("#bookmarkCourse").disabled = searchMode;
  $("#shareCourse").disabled = searchMode;
  $("#downloadCourse").disabled = searchMode;
  $("#prevCourse").disabled = searchMode;
  $("#nextCourse").disabled = searchMode;
  renderLibraryCourseList();
  renderLibrarySessions();
  $("#courseSupport").innerHTML = librarySavedNotesMarkup(course, focusCourse, focusSession, filteredCourses, filteredSessions);
  $("#courseGlossaryHeading").textContent = searchMode ? "Key Passage" : "Daily Reading";
  $("#courseGlossaryCount").textContent = searchMode ? "Best match" : "1 verse";
  $("#courseGlossary").innerHTML = libraryReadingMarkup(glossaryCourse, focusSession);
  $("#libraryGoalCount").textContent = searchMode ? `${filteredSessions.length} found` : `${Math.min(3, completedSessionCount(course))} / 3`;
  $("#libraryGoal").innerHTML = libraryGoalMarkup(course, searchMode, filteredSessions);
  renderIcons($("#libraryView"));
}

function courseMatches(course, query) {
  if (!query) return true;
  const haystack = [
    course.title,
    course.description,
    course.category,
    ...course.objectives,
    ...normalizedReadingsForCourse(course).map((item) => resourceSearchText(item)),
    ...normalizedCrosswaySourcesForCourse(course).map((item) => resourceSearchText(item)),
    ...(course.personalLibrary || []),
    state.notes[course.id] || "",
    ...course.sessions.map((session) => sessionSearchText(course, session)),
  ].join(" ");
  return includesTerms(haystack, query);
}

function renderCourseList() {
  const filtered = courses.filter((course) => courseMatches(course, state.query));
  $("#courseCount").textContent = `${filtered.length} course${filtered.length === 1 ? "" : "s"}`;
  $("#courseList").innerHTML = filtered
    .map((course) => {
      const index = courses.indexOf(course);
      const stats = courseStudyStats(course);
      return `
        <button class="course-row ${index === state.selectedCourse ? "active" : ""}" data-course-route="${coursePath(course)}" data-course="${index}">
          <span class="course-number">${String(course.number).padStart(2, "0")}</span>
          <span>
            <strong>${course.title}</strong>
            <small>${state.query ? `${matchingSessionsForCourse(course, state.query).length} matching sessions Â· ${course.description}` : course.description}</small>
            <small class="course-category-label">${escapeHtml(course.category)}</small>
          </span>
          <span class="progress-pill" title="${stats.reflections} reflections, ${stats.drafts} drafts, ${stats.quizzes} quiz attempts">${courseProgress(course)}%</span>
        </button>
      `;
    })
    .join("") || '<article class="note-card"><strong>No course matches</strong><small>Try a doctrine, Scripture reference, reading, or lecture term.</small></article>';
}

function matchingSessionsForCourse(course, query = state.query) {
  return course.sessions.filter((session) => includesTerms(sessionSearchText(course, session), query));
}

function renderSessions() {
  const course = currentCourse();
  const sessions = state.query ? matchingSessions(state.query) : courseRoadmapSessions(course);
  $("#sessionCount").textContent = state.query
    ? `${sessions.length} matching session${sessions.length === 1 ? "" : "s"}`
    : `${course.sessions.length} guided sessions`;
  $("#sessionList").innerHTML = sessions
    .map((item) => {
      const itemCourse = item.course;
      const session = item.session;
      const owningIndex = courses.indexOf(itemCourse);
      const done = "done" in item ? item.done : Boolean(state.completed[sessionKey(itemCourse, session)]);
      const isNext = Boolean(item.isNext);
      const route = sessionPath(itemCourse, session);
      const isCurrentRoute = !state.query && window.location.pathname === route;
      const attempts = state.study.quizAttempts.filter((item) => item.course_id === itemCourse.id && Number(item.session_number) === session.number);
      const reflections = Object.values(state.study.reflections).filter((item) => item.course_id === itemCourse.id && Number(item.session_number) === session.number && item.body?.trim()).length;
      const drafts = Object.values(state.study.drafts).filter((item) => item.course_id === itemCourse.id && Number(item.session_number) === session.number && (item.title?.trim() || item.body?.trim())).length;
      const stateLabel = done ? "Complete" : isCurrentRoute ? "Current" : isNext ? "Next" : "Queued";
      const actionLabel = state.query ? "Open Match" : isCurrentRoute ? "Current Session" : isNext ? "Open Next Session" : "Open Session";
      return `
        <article class="session-card roadmap-card ${done ? "is-complete" : ""} ${isNext ? "is-next" : ""}" ${state.query ? `data-open-course-session="${owningIndex}:${session.number}"` : `data-session="${session.number}"`} ${
          item.mobileOrder != null ? `style="order:${item.mobileOrder}"` : ""
        }>
          <div class="session-top">
            <div>
              <span class="session-index">${state.query ? `Course ${itemCourse.number} Â· ` : ""}Session ${session.number}</span>
              <strong>${session.title}</strong>
              <small>${session.reflection.find((line) => line.startsWith("Memorize:")) || "Guided lecture, reading, and lab"}</small>
            </div>
            <div class="session-actions">
              <span class="session-state-pill">${state.query ? "Match" : stateLabel}</span>
              <button class="tiny-button ${done ? "done" : ""}" data-complete="${session.number}" data-complete-course="${owningIndex}" type="button" aria-label="Mark session complete">
                <span data-icon="${done ? "check" : "bookmark"}"></span>
              </button>
            </div>
          </div>
          <p class="session-preview">${state.query ? escapeHtml(searchSnippet(itemCourse, session, state.query)) : session.lecture[0] || "Open the session to review the study outline."}</p>
          <div class="session-meta">
            <span class="tag">${session.lecture.length} lecture points</span>
            <span class="tag">${session.reflectionPrompts?.length || 0} prompts</span>
            <span class="tag">${session.researchTasks?.length || session.lab.length} writing tasks</span>
            ${attempts.length ? `<span class="tag">${attempts.length} quiz attempt${attempts.length === 1 ? "" : "s"}</span>` : ""}
            ${reflections || drafts ? `<span class="tag">${reflections + drafts} saved item${reflections + drafts === 1 ? "" : "s"}</span>` : ""}
          </div>
          <div class="roadmap-card-actions">
            <button class="secondary-action" type="button" data-session-route="${route}">
              <span>${actionLabel}</span>
              <span data-icon="arrow-right"></span>
            </button>
          </div>
        </article>
      `;
    })
    .join("") || '<article class="note-card"><strong>No session matches</strong><small>Search terms are matched against full lecture notes, reflection prompts, research tasks, Scripture, readings, and glossary terms.</small></article>';
  renderIcons($("#sessionList"));
}

function renderLibraryCourseList() {
  const filtered = courses.filter((course) => courseMatches(course, state.query));
  const selectedIndex = state.query ? 0 : state.selectedCourse;
  const primaryShelf = state.query ? filtered.slice(0, 4) : shelfSlice(selectedIndex, 4);
  const middleShelf = state.query ? filtered.slice(4, 9) : shelfSlice(selectedIndex + 4, 5);
  const lastShelf = state.query ? filtered.slice(9, 14) : shelfSlice(selectedIndex + 9, Math.min(5, courses.length));
  const completedCourses = courses.filter((course) => courseProgress(course) === 100).slice(0, 5);

  $("#courseCount").textContent = state.query ? `${filtered.length} course${filtered.length === 1 ? "" : "s"}` : `${courses.length} courses`;
  $("#currentShelf").innerHTML =
    primaryShelf.map((course) => courseBookMarkup(course)).join("") ||
    '<article class="note-card"><strong>No course matches</strong><small>Try a doctrine, Scripture reference, reading, or lecture term.</small></article>';
  $("#courseList").innerHTML = lastShelf.map((course) => courseBookMarkup(course, { compact: true })).join("");
  $("#completedShelf").innerHTML = (completedCourses.length ? completedCourses : courses.slice(0, 5))
    .map((course) => courseBookMarkup(course, { completed: true, compact: true }))
    .join("");

  if (!state.query) $("#sessionList").innerHTML = middleShelf.map((course) => courseBookMarkup(course, { compact: true })).join("");
}

function renderLibrarySessions() {
  const course = currentCourse();
  const sessions = state.query ? matchingSessions(state.query).slice(0, 5) : libraryUpcomingSessions(course, 2).map((session) => ({ course, session }));
  $("#sessionCount").textContent = state.query ? `${sessions.length} matching session${sessions.length === 1 ? "" : "s"}` : `${sessions.length} queued`;
  if (!state.query) {
    renderIcons($("#sessionList"));
    return;
  }
  $("#sessionList").innerHTML = sessions
    .map((item) => {
      const itemCourse = item.course;
      const session = item.session;
      const owningIndex = courses.indexOf(itemCourse);
      const done = "done" in item ? item.done : Boolean(state.completed[sessionKey(itemCourse, session)]);
      const route = sessionPath(itemCourse, session);
      return `
        <article class="search-session-card ${done ? "is-complete" : ""}" data-open-course-session="${owningIndex}:${session.number}">
          <span class="detail-kicker">Course ${itemCourse.number} / Session ${session.number}</span>
          <strong>${escapeHtml(session.title)}</strong>
          <small>${escapeHtml(searchSnippet(itemCourse, session, state.query))}</small>
          <button class="secondary-action" type="button" data-session-route="${route}">
            <span>Open Match</span>
            <span data-icon="arrow-right"></span>
          </button>
        </article>
      `;
    })
    .join("") || '<article class="note-card"><strong>No session matches</strong><small>Search terms are matched against full lecture notes, reflection prompts, research tasks, Scripture, readings, and glossary terms.</small></article>';
}

function renderProgressView() {
  const totalSessions = courses.reduce((sum, course) => sum + course.sessions.length, 0);
  const doneSessions = Object.keys(state.completed).filter((key) => state.completed[key]).length;
  const overall = Math.round((doneSessions / totalSessions) * 100);
  $("#progressView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div>
          <span>Formation Track</span>
          <h2>My Progress</h2>
        </div>
        <strong>${overall}% complete</strong>
      </div>
      <p class="view-intro">Track completion across the twelve short courses and use the session checkmarks as a simple pastoral study ledger.</p>
      <div class="progress-grid">
        ${courses
          .map((course) => {
            const percent = courseProgress(course);
            return `
              <article class="progress-card" data-select-course="${courses.indexOf(course)}" style="cursor:pointer">
                <strong>${String(course.number).padStart(2, "0")} / ${course.title}</strong>
                <small>${course.sessions.length} sessions · ${course.level}</small>
                <div class="progress-bar"><span style="width:${percent}%"></span></div>
              </article>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderScheduleView() {
  $("#scheduleView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div>
          <span>Self-paced Plan</span>
          <h2>Schedule</h2>
        </div>
        <strong>12 weeks</strong>
      </div>
      <p class="view-intro">A steady path assigns one course per week and four sessions across the week. Adjust it around preaching, counseling, and discipleship commitments.</p>
      <div class="progress-grid">
        ${courses
          .map(
            (course) => `
            <article class="progress-card" data-select-course="${courses.indexOf(course)}" style="cursor:pointer">
              <strong>Week ${course.number}: ${course.title}</strong>
              <small>Mon lecture · Wed reading and reflection · Fri lab · Sun review</small>
              <div class="progress-bar"><span style="width:${courseProgress(course)}%"></span></div>
            </article>
          `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderNotesView() {
  const course = currentCourse();
  $("#notesView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div>
          <span>Current Course</span>
          <h2>Notes</h2>
        </div>
      </div>
      <p class="view-intro">${course.title}</p>
      <textarea id="courseNotes" class="note-input" placeholder="Add pastoral observations, sermon links, counseling implications, or student follow-up notes...">${state.notes[course.id] || ""}</textarea>
    </div>
  `;
  $("#courseNotes").addEventListener("input", (event) => {
    state.notes[course.id] = event.target.value;
    saveState("shepherd-notes", state.notes);
  });
}

function renderBookmarksView() {
  const bookmarked = courses.filter((course) => state.bookmarks[course.id]);
  $("#bookmarksView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div>
          <span>Saved Courses</span>
          <h2>Bookmarks</h2>
        </div>
        <strong>${bookmarked.length} saved</strong>
      </div>
      <p class="view-intro">Bookmarked courses stay here for fast access during mentoring, lesson planning, or personal study.</p>
      <div class="course-list">
        ${
          bookmarked.length
            ? bookmarked
                .map(
                  (course) => `
                    <button class="course-row" data-course="${courses.indexOf(course)}">
                      <span class="course-number">${String(course.number).padStart(2, "0")}</span>
                      <span><strong>${course.title}</strong><small>${course.description}</small></span>
                      <span class="progress-pill">${courseProgress(course)}%</span>
                    </button>
                  `
                )
                .join("")
            : '<article class="note-card"><strong>No bookmarks yet</strong><small>Use the bookmark button on a course to save it here.</small></article>'
        }
      </div>
    </div>
  `;
}

function renderProgressPageLegacy() {
  const course = currentCourse();
  const totalSessions = courses.reduce((sum, item) => sum + item.sessions.length, 0);
  const completed = allCompletedSessions();
  const doneSessions = completed.length;
  const overall = Math.round((doneSessions / totalSessions) * 100);
  const nextSession = nextSessionForCourse(course);
  const reflections = Object.values(state.study.reflections).filter((item) => item.body?.trim());
  const drafts = Object.values(state.study.drafts).filter((item) => item.title?.trim() || item.body?.trim());
  const notes = Object.values(state.notes).filter((value) => value?.trim());
  const quizAttempts = state.study.quizAttempts;
  const quizAverage = quizAttempts.length
    ? Math.round((quizAttempts.reduce((sum, item) => sum + item.score / Math.max(1, item.total_questions), 0) / quizAttempts.length) * 100)
    : 0;
  const courseStats = courseStudyStats(course);
  $("#progressView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Formation Track</span><h2>My Progress</h2></div>
        <strong>${state.databaseReady ? "SQLite live" : "Browser only"}</strong>
      </div>
      <p class="view-intro">See course completion, saved study work, and the next session that needs attention.</p>
      <div class="dashboard-strip">
        <article class="metric-card"><span>Overall</span><strong>${overall}%</strong><small>${doneSessions} completed sessions</small></article>
        <article class="metric-card"><span>Quiz Average</span><strong>${quizAttempts.length ? `${quizAverage}%` : "â€”"}</strong><small>${quizAttempts.length} saved attempt${quizAttempts.length === 1 ? "" : "s"}</small></article>
        <article class="metric-card"><span>Study Work</span><strong>${reflections.length + drafts.length + notes.length}</strong><small>${reflections.length} reflections Â· ${drafts.length} drafts Â· ${notes.length} notes</small></article>
      </div>
      <div class="dashboard-strip">
        <article class="metric-card"><span>Current Course</span><strong>${completedSessionCount(course)}/${course.sessions.length}</strong><small>${course.title}</small></article>
        <article class="metric-card"><span>Next Session</span><strong>${nextSession.number}</strong><small>${nextSession.title}</small></article>
        <article class="metric-card"><span>Database</span><strong>${state.databaseReady ? "On" : "Off"}</strong><small>${state.databaseReady ? "Saving locally to SQLite" : "Start the local server to sync"}</small></article>
      </div>
      <div class="progress-grid">
        ${courses
          .map((item) => {
            const stats = courseStudyStats(item);
            return `
            <article class="progress-card" data-select-course="${courses.indexOf(item)}">
              <strong>${String(item.number).padStart(2, "0")} / ${item.title}</strong>
              <small>${stats.completed} of ${item.sessions.length} sessions Â· ${stats.quizzes} quizzes Â· ${stats.reflections} reflections Â· ${stats.drafts} drafts</small>
              <div class="progress-bar"><span style="width:${courseProgress(item)}%"></span></div>
            </article>
          `;
          })
          .join("")}
      </div>
      <section class="page-section">
        <div class="section-heading"><span>Recently Completed</span><strong>${completed.length} total</strong></div>
        <div class="resource-grid">
          ${
            completed.length
              ? completed
                  .slice(-4)
                  .reverse()
                  .map(({ course, session }) => `
                    <article class="resource-card" data-select-course="${courses.indexOf(course)}">
                      <strong>${course.number}.${session.number} ${session.title}</strong>
                      <small>${course.title}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No completed sessions yet</strong><small>Mark a session complete from the Library to begin tracking progress.</small></article>'
          }
        </div>
      </section>
    </div>
  `;
}

function renderSchedulePageLegacy() {
  const course = currentCourse();
  $("#scheduleView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Self-paced Plan</span><h2>Schedule</h2></div>
        <strong>12 weeks</strong>
      </div>
      <p class="view-intro">One course per week, four sessions across the week, and a direct path to the next unfinished lecture.</p>
      <section class="current-course-panel">
        <div><span class="detail-kicker">This Week</span><h3>${course.title}</h3><p>${course.description}</p></div>
        <strong>${courseProgress(course)}%</strong>
      </section>
      <div class="resource-grid">
        ${course.sessions
          .map((session, index) => `
            <article class="resource-card" data-session="${session.number}">
              <span class="detail-kicker">Day ${["Mon", "Wed", "Fri", "Sun"][index]}</span>
              <strong>${session.title}</strong>
              <small>${memoryLine(session)}</small>
            </article>
          `)
          .join("")}
      </div>
      <section class="page-section">
        <div class="section-heading"><span>Course Roadmap</span><strong>${courses.length} weeks</strong></div>
        <div class="progress-grid">
          ${courses
            .map((item) => `
              <article class="progress-card" data-select-course="${courses.indexOf(item)}">
                <strong>Week ${item.number}: ${item.title}</strong>
                <small>Mon lecture &middot; Wed reading and reflection &middot; Fri lab &middot; Sun review</small>
                <div class="progress-bar"><span style="width:${courseProgress(item)}%"></span></div>
              </article>
            `)
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderNotesPageLegacy() {
  const course = currentCourse();
  const notedCourses = courses.filter((item) => state.notes[item.id]?.trim());
  const courseReflections = Object.values(state.study.reflections).filter((item) => item.course_id === course.id && item.body?.trim());
  const courseDrafts = Object.values(state.study.drafts).filter((item) => item.course_id === course.id && (item.title?.trim() || item.body?.trim()));
  const courseAttempts = state.study.quizAttempts.filter((item) => item.course_id === course.id);
  $("#notesView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Study Archive</span><h2>Notes</h2></div>
        <strong>${courseReflections.length + courseDrafts.length + notedCourses.length} saved</strong>
      </div>
      <p class="view-intro">Keep one active notebook, then review saved reflections, drafts, and quiz history below it.</p>
      ${selectedCourseButton(course)}
      <label class="study-field">
        <span>Course Notes</span>
        <textarea
          id="courseNotes"
          class="note-input"
          data-study-type="course-note"
          data-save-id="course-note-${course.id}"
          data-course-id="${course.id}"
          placeholder="Add pastoral observations, sermon links, counseling implications, or student follow-up notes..."
        >${escapeHtml(state.notes[course.id] || "")}</textarea>
        <small data-save-status="course-note-${course.id}">${state.databaseReady ? "Saved to SQLite" : "Browser storage only"}</small>
      </label>
      <section class="page-section">
        <div class="section-heading"><span>Reading Reflections</span><strong>${courseReflections.length} saved</strong></div>
        <div class="resource-grid">
          ${
            courseReflections.length
              ? courseReflections
                  .map((item) => `
                    <article class="note-card" data-session="${item.session_number}">
                      <strong>Session ${item.session_number}: ${item.prompt_text}</strong>
                      <small>${escapeHtml(item.body).slice(0, 240)}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No reflections yet</strong><small>Open a lecture and write in the Reading Reflection workspace.</small></article>'
          }
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Research & Writing</span><strong>${courseDrafts.length} drafts</strong></div>
        <div class="resource-grid">
          ${
            courseDrafts.length
              ? courseDrafts
                  .map((item) => `
                    <article class="note-card" data-session="${item.session_number}">
                      <strong>${escapeHtml(item.title || `Session ${item.session_number} Draft`)}</strong>
                      <small>${escapeHtml(item.body || item.task_text).slice(0, 240)}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No research drafts yet</strong><small>Open a lecture and draft from the Lab / Research workspace.</small></article>'
          }
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Quiz History</span><strong>${courseAttempts.length} attempts</strong></div>
        <div class="resource-grid">
          ${
            courseAttempts.length
              ? courseAttempts
                  .slice(0, 8)
                  .map((item) => `
                    <article class="note-card" data-session="${item.session_number}">
                      <strong>Session ${item.session_number}: ${item.score}/${item.total_questions}</strong>
                      <small>${new Date(`${item.created_at}Z`).toLocaleString()}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No quiz attempts yet</strong><small>Complete a Memory Check to save your score here.</small></article>'
          }
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Saved Notes</span><strong>${notedCourses.length} courses</strong></div>
        <div class="resource-grid">
          ${
            notedCourses.length
              ? notedCourses
                  .map((notedCourse) => `
                    <article class="note-card" data-select-course="${courses.indexOf(notedCourse)}">
                      <strong>${notedCourse.title}</strong>
                      <small>${state.notes[notedCourse.id].slice(0, 180)}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No saved notes yet</strong><small>Use the note field above to create course-specific notes.</small></article>'
          }
        </div>
      </section>
    </div>
  `;
}

function renderBookmarksPageLegacy() {
  const bookmarked = courses.filter((course) => state.bookmarks[course.id]);
  const completed = allCompletedSessions();
  $("#bookmarksView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Saved Courses</span><h2>Bookmarks</h2></div>
        <strong>${bookmarked.length} saved</strong>
      </div>
      <p class="view-intro">Use this view as a saved-course shelf for the studies you reopen most often.</p>
      <div class="course-list">
        ${
          bookmarked.length
            ? bookmarked.map((course) => selectedCourseButton(course)).join("")
            : '<article class="note-card"><strong>No bookmarks yet</strong><small>Use the bookmark button on a course to save it here.</small></article>'
        }
      </div>
      <section class="page-section">
        <div class="section-heading"><span>Completed References</span><strong>${completed.length} sessions</strong></div>
        <div class="resource-grid">
          ${
            completed.length
              ? completed
                  .slice(-6)
                  .reverse()
                  .map(({ course, session }) => `
                    <article class="resource-card" data-select-course="${courses.indexOf(course)}">
                      <strong>${session.title}</strong>
                      <small>${course.title} &middot; ${memoryLine(session)}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No completed references yet</strong><small>Completed sessions will appear here for quick review.</small></article>'
          }
        </div>
      </section>
    </div>
  `;
}

function renderProgressPage() {
  const course = currentCourse();
  const totalSessions = courses.reduce((sum, item) => sum + item.sessions.length, 0);
  const completed = allCompletedSessions();
  const doneSessions = completed.length;
  const overall = Math.round((doneSessions / totalSessions) * 100);
  const nextSession = nextSessionForCourse(course);
  const reflections = Object.values(state.study.reflections).filter((item) => item.body?.trim());
  const drafts = Object.values(state.study.drafts).filter((item) => item.title?.trim() || item.body?.trim());
  const notes = Object.values(state.notes).filter((value) => value?.trim());
  const quizAttempts = state.study.quizAttempts;
  const quizAverage = quizAttempts.length
    ? Math.round((quizAttempts.reduce((sum, item) => sum + item.score / Math.max(1, item.total_questions), 0) / quizAttempts.length) * 100)
    : 0;
  const courseStats = courseStudyStats(course);
  $("#progressView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Formation Track</span><h2>My Progress</h2></div>
        <strong>${state.databaseReady ? "SQLite live" : "Browser only"}</strong>
      </div>
      <p class="view-intro">Track completed sessions, quiz attempts, reflections, notes, and research drafts from the local SQLite study database.</p>
      ${dashboardFocusPanel({
        kicker: "Current Focus",
        title: course.title,
        description: course.description,
        metaItems: [
          `${courseStats.completed}/${course.sessions.length} sessions complete`,
          `Next session: ${nextSession.number} ${nextSession.title}`,
          state.databaseReady ? "SQLite autosave active" : "Browser-first until server is active",
        ],
        asideValue: `${courseProgress(course)}%`,
        asideLabel: "current course completion",
        ctaMarkup: `<button class="primary-action" type="button" data-session="${nextSession.number}"><span>Open Next Session</span><span data-icon="arrow-right"></span></button>`,
      })}
      <div class="dashboard-strip dashboard-metrics-row">
        ${dashboardMetricMarkup("Overall", `${overall}%`, `${doneSessions} completed sessions`)}
        ${dashboardMetricMarkup("Quiz Average", quizAttempts.length ? `${quizAverage}%` : "&mdash;", `${quizAttempts.length} saved attempt${quizAttempts.length === 1 ? "" : "s"}`)}
        ${dashboardMetricMarkup("Study Work", reflections.length + drafts.length + notes.length, `${reflections.length} reflections Â· ${drafts.length} drafts Â· ${notes.length} notes`)}
        ${dashboardMetricMarkup("Database", state.databaseReady ? "On" : "Off", state.databaseReady ? "saving locally to SQLite" : "start the local server to sync")}
      </div>
      <section class="page-section">
        <div class="section-heading"><span>Course Progress</span><strong>${courses.length} courses</strong></div>
        <div class="dashboard-compact-grid">
          ${courses
            .map((item) => {
              const stats = courseStudyStats(item);
              return `
                <article class="progress-card progress-card-compact" data-select-course="${courses.indexOf(item)}">
                  <div class="compact-card-top">
                    <span class="detail-kicker">Course ${item.number}</span>
                    <strong>${courseProgress(item)}%</strong>
                  </div>
                  <strong>${item.title}</strong>
                  <small>${stats.completed}/${item.sessions.length} sessions Â· ${stats.quizzes} quizzes Â· ${stats.reflections + stats.drafts} saved study items</small>
                  <div class="progress-bar"><span style="width:${courseProgress(item)}%"></span></div>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Recently Completed</span><strong>${completed.length} total</strong></div>
        <div class="dashboard-compact-grid">
          ${
            completed.length
              ? completed
                  .slice(-4)
                  .reverse()
                  .map(({ course: itemCourse, session }) => `
                    <article class="resource-card resource-card-compact" data-select-course="${courses.indexOf(itemCourse)}">
                      <span class="detail-kicker">Course ${itemCourse.number} Â· Session ${session.number}</span>
                      <strong>${session.title}</strong>
                      <small>${itemCourse.title}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No completed sessions yet</strong><small>Mark a session complete from the Library to begin tracking progress.</small></article>'
          }
        </div>
      </section>
    </div>
  `;
}

function renderSchedulePage() {
  const course = currentCourse();
  const nextSession = nextSessionForCourse(course);
  const completed = completedSessionCount(course);
  const weekDays = ["Mon", "Wed", "Fri", "Sun"];
  $("#scheduleView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Self-paced Plan</span><h2>Schedule</h2></div>
        <div class="schedule-week-switcher">
          <button class="icon-button" type="button" data-schedule-shift="-1" aria-label="Previous week">
            <span data-icon="arrow-up"></span>
          </button>
          <strong>Week ${course.number} of ${courses.length}</strong>
          <button class="icon-button" type="button" data-schedule-shift="1" aria-label="Next week">
            <span data-icon="arrow-down"></span>
          </button>
        </div>
      </div>
      <p class="view-intro">A steady path assigns one course per week and four sessions across the week. The current course plan updates when a different course is selected.</p>
      ${dashboardFocusPanel({
        kicker: "This Week",
        title: course.title,
        description: course.description,
        metaItems: [
          `${completed}/${course.sessions.length} sessions complete`,
          `Next session: ${nextSession.number} ${nextSession.title}`,
          `${course.readings.length} reading assignments`,
        ],
        asideValue: `${courseProgress(course)}%`,
        asideLabel: "selected course progress",
        ctaMarkup: `<button class="primary-action" type="button" data-session="${nextSession.number}"><span>Open Next Session</span><span data-icon="arrow-right"></span></button>`,
      })}
      <div class="dashboard-strip dashboard-metrics-row dashboard-metrics-row-3">
        ${dashboardMetricMarkup("Current Week", `Week ${course.number}`, course.category)}
        ${dashboardMetricMarkup("Sessions", `${course.sessions.length}`, `${completed} completed so far`)}
        ${dashboardMetricMarkup("Next Focus", `${nextSession.number}`, nextSession.title)}
      </div>
      <section class="page-section">
        <div class="section-heading"><span>Session Plan</span><strong>${course.sessions.length} days</strong></div>
        <div class="schedule-session-grid">
          ${course.sessions
            .map((session, index) => {
              const isDone = Boolean(state.completed[sessionKey(course, session)]);
              const isNext = nextSession.number === session.number && !isDone;
              return `
                <article class="resource-card resource-card-compact schedule-session-card ${isDone ? "is-complete" : ""} ${isNext ? "is-next" : ""}" data-session="${session.number}">
                  <div class="schedule-session-top">
                    <span class="detail-kicker">${weekDays[index]}</span>
                    <span class="schedule-session-state">${isDone ? "Complete" : isNext ? "Next up" : "Queued"}</span>
                  </div>
                  <strong>Session ${session.number}: ${session.title}</strong>
                  <small>${memoryLine(session)}</small>
                  <div class="schedule-session-meta">
                    <span class="tag">${session.lecture.length} lecture points</span>
                    <span class="tag">${session.lab.length} lab items</span>
                  </div>
                  <div class="schedule-session-actions">
                    <button class="secondary-action schedule-open-button" type="button" data-session-route="${sessionPath(course, session)}">
                      <span>Open Session</span>
                      <span data-icon="arrow-right"></span>
                    </button>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Course Roadmap</span><strong>${courses.length} weeks</strong></div>
        <div class="dashboard-compact-grid">
          ${courses
            .map((item) => `
              <article class="progress-card progress-card-compact ${item === course ? "is-active-week" : ""}" data-schedule-course="${courses.indexOf(item)}">
                <div class="compact-card-top">
                  <span class="detail-kicker">Week ${item.number}</span>
                  <strong>${courseProgress(item)}%</strong>
                </div>
                <strong>${item.title}</strong>
                <small>Mon lecture Â· Wed reflection Â· Fri lab Â· Sun review</small>
                <div class="progress-bar"><span style="width:${courseProgress(item)}%"></span></div>
              </article>
            `)
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderNotesPage() {
  const course = currentCourse();
  const notedCourses = courses.filter((item) => state.notes[item.id]?.trim());
  const courseReflections = Object.values(state.study.reflections).filter((item) => item.course_id === course.id && item.body?.trim());
  const courseDrafts = Object.values(state.study.drafts).filter((item) => item.course_id === course.id && (item.title?.trim() || item.body?.trim()));
  const courseAttempts = state.study.quizAttempts.filter((item) => item.course_id === course.id);
  const nextSession = nextSessionForCourse(course);
  const noteBody = state.notes[course.id] || "";
  const noteWords = wordCount(noteBody);
  $("#notesView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Study Archive</span><h2>Notes</h2></div>
        <strong>${courseReflections.length + courseDrafts.length + notedCourses.length} saved</strong>
      </div>
      <p class="view-intro">Review saved course notes, reading reflections, research drafts, and quiz history for the selected course.</p>
      ${dashboardFocusPanel({
        kicker: "Active Course",
        title: course.title,
        description: "Keep course-level observations, sermon links, counseling implications, and follow-up notes in one active writing surface.",
        metaItems: [
          `${courseReflections.length} reflections`,
          `${courseDrafts.length} drafts`,
          `${courseAttempts.length} quiz attempts`,
        ],
        asideValue: `${(state.notes[course.id] || "").trim().length ? "Live" : "Blank"}`,
        asideLabel: "course note status",
      })}
      <section class="page-section page-section-tight">
        <div class="notes-course-switcher">
          <button class="icon-button" type="button" data-notes-shift="-1" aria-label="Previous course">
            <span data-icon="arrow-up"></span>
          </button>
          <div class="notes-course-switcher-copy">
            <span class="detail-kicker">Notebook Context</span>
            <strong>Course ${course.number} Â· ${course.category}</strong>
          </div>
          <button class="icon-button" type="button" data-notes-shift="1" aria-label="Next course">
            <span data-icon="arrow-down"></span>
          </button>
        </div>
        <div class="notes-workbench">
          <div class="notes-editor-panel">
            <div class="section-heading"><span>Course Notes</span><strong>${noteWords} words</strong></div>
            <label class="study-field study-field-wide">
              <span class="study-field-prompt">Working notebook for ${course.title}</span>
              <textarea
                id="courseNotes"
                class="note-input note-input-featured"
                data-study-type="course-note"
                data-save-id="course-note-${course.id}"
                data-course-id="${course.id}"
                placeholder="Add pastoral observations, sermon links, counseling implications, or student follow-up notes..."
              >${escapeHtml(noteBody)}</textarea>
              <small data-save-status="course-note-${course.id}">${state.databaseReady ? "Saved to SQLite" : "Browser storage only"}</small>
            </label>
          </div>
          <aside class="notes-sidebar">
            <article class="notes-side-card">
              <span class="detail-kicker">Status</span>
              <strong>${noteWords ? "In progress" : "Ready to write"}</strong>
              <small>${noteWords ? `${noteWords} words captured for this course` : "Start with one summary, one application, and one follow-up action."}</small>
            </article>
            <article class="notes-side-card">
              <span class="detail-kicker">Next Session</span>
              <strong>${nextSession.number}. ${nextSession.title}</strong>
              <small>${memoryLine(nextSession)}</small>
              <div class="notes-side-actions">
                <button class="secondary-action" type="button" data-session="${nextSession.number}">
                  <span>Open Session</span>
                  <span data-icon="arrow-right"></span>
                </button>
              </div>
            </article>
            <article class="notes-side-card">
              <span class="detail-kicker">Study Snapshot</span>
              <div class="notes-stat-list">
                <div class="notes-stat"><span>Reflections</span><strong>${courseReflections.length}</strong></div>
                <div class="notes-stat"><span>Drafts</span><strong>${courseDrafts.length}</strong></div>
                <div class="notes-stat"><span>Quizzes</span><strong>${courseAttempts.length}</strong></div>
              </div>
            </article>
          </aside>
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Reading Reflections</span><strong>${courseReflections.length} saved</strong></div>
        <div class="dashboard-compact-grid">
          ${
            courseReflections.length
              ? courseReflections
                  .map((item) => `
                    <article class="note-card note-card-compact" data-session="${item.session_number}">
                      <span class="detail-kicker">Session ${item.session_number}</span>
                      <strong>${item.prompt_text}</strong>
                      <small>${escapeHtml(item.body).slice(0, 220)}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No reflections yet</strong><small>Open a lecture and write in the Reading Reflection workspace.</small></article>'
          }
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Research & Writing</span><strong>${courseDrafts.length} drafts</strong></div>
        <div class="dashboard-compact-grid">
          ${
            courseDrafts.length
              ? courseDrafts
                  .map((item) => `
                    <article class="note-card note-card-compact" data-session="${item.session_number}">
                      <span class="detail-kicker">Session ${item.session_number}</span>
                      <strong>${escapeHtml(item.title || `Draft in progress`)}</strong>
                      <small>${escapeHtml(item.body || item.task_text).slice(0, 220)}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No research drafts yet</strong><small>Open a lecture and draft from the Lab / Research workspace.</small></article>'
          }
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Quiz History</span><strong>${courseAttempts.length} attempts</strong></div>
        <div class="dashboard-compact-grid">
          ${
            courseAttempts.length
              ? courseAttempts
                  .slice(0, 8)
                  .map((item) => `
                    <article class="note-card note-card-compact" data-session="${item.session_number}">
                      <span class="detail-kicker">Session ${item.session_number}</span>
                      <strong>${item.score}/${item.total_questions}</strong>
                      <small>${new Date(`${item.created_at}Z`).toLocaleString()}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No quiz attempts yet</strong><small>Complete a Memory Check to save your score here.</small></article>'
          }
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Saved Notes</span><strong>${notedCourses.length} courses</strong></div>
        <div class="dashboard-compact-grid">
          ${
            notedCourses.length
              ? notedCourses
                  .map((notedCourse) => `
                    <article class="note-card note-card-compact" data-notes-course="${courses.indexOf(notedCourse)}">
                      <span class="detail-kicker">Course ${notedCourse.number}</span>
                      <strong>${notedCourse.title}</strong>
                      <small>${state.notes[notedCourse.id].slice(0, 180)}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No saved notes yet</strong><small>Use the note field above to create course-specific notes.</small></article>'
          }
        </div>
      </section>
    </div>
  `;
}

function renderBookmarksPage() {
  const bookmarked = courses.filter((course) => state.bookmarks[course.id]);
  const featured = bookmarkedCourseSelection(bookmarked);
  const completed = allCompletedSessions().filter(({ course }) => bookmarked.some((item) => item.id === course.id));
  const bookmarkedWithNotes = bookmarked.filter((course) => state.notes[course.id]?.trim()).length;
  const totalSavedSessions = bookmarked.reduce((sum, course) => sum + completedSessionCount(course), 0);
  $("#bookmarksView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Saved Courses</span><h2>Bookmarks</h2></div>
        <strong>${bookmarked.length} saved</strong>
      </div>
      <p class="view-intro">Bookmarked courses stay here for fast access during mentoring, lesson planning, or personal study.</p>
      ${
        featured
          ? `
            ${dashboardFocusPanel({
              kicker: "Saved Focus",
              title: featured.title,
              description: featured.description,
              metaItems: [
                `${completedSessionCount(featured)}/${featured.sessions.length} sessions complete`,
                `${featured.readings.length} readings`,
                state.notes[featured.id]?.trim() ? "has saved notes" : "no course note yet",
              ],
              asideValue: `${courseProgress(featured)}%`,
              asideLabel: "featured bookmark progress",
              ctaMarkup: `
                <button class="primary-action" type="button" data-bookmark-course="${courses.indexOf(featured)}"><span>Focus This Course</span><span data-icon="arrow-right"></span></button>
                <button class="secondary-action" type="button" data-bookmark-remove="${courses.indexOf(featured)}"><span>Remove Bookmark</span></button>
              `,
            })}
            <div class="dashboard-strip dashboard-metrics-row dashboard-metrics-row-3">
              ${dashboardMetricMarkup("Saved Courses", bookmarked.length, "available in this workspace")}
              ${dashboardMetricMarkup("Completed Sessions", totalSavedSessions, "inside bookmarked courses")}
              ${dashboardMetricMarkup("Courses With Notes", bookmarkedWithNotes, "saved notebook entries")}
            </div>
          `
          : ""
      }
      <div class="dashboard-compact-grid bookmark-grid">
        ${
          bookmarked.length
            ? bookmarked
                .map((course) => {
                  const nextSession = nextSessionForCourse(course);
                  const isFeatured = featured?.id === course.id;
                  return `
                    <article class="progress-card progress-card-compact bookmark-card ${isFeatured ? "is-active-week" : ""}" data-bookmark-course="${courses.indexOf(course)}">
                      <div class="compact-card-top">
                        <span class="detail-kicker">Course ${course.number}</span>
                        <strong>${courseProgress(course)}%</strong>
                      </div>
                      <strong>${course.title}</strong>
                      <small>${course.category} Â· Next: ${nextSession.number}. ${nextSession.title}</small>
                      <div class="bookmark-card-actions">
                        <button class="secondary-action" type="button" data-bookmark-course="${courses.indexOf(course)}">
                          <span>Use in Bookmarks</span>
                        </button>
                        <button class="icon-button" type="button" data-bookmark-remove="${courses.indexOf(course)}" aria-label="Remove bookmark">
                          <span data-icon="bookmark"></span>
                        </button>
                      </div>
                    </article>
                  `;
                })
                .join("")
            : '<article class="note-card"><strong>No bookmarks yet</strong><small>Use the bookmark button on a course to save it here.</small></article>'
        }
      </div>
      <section class="page-section">
        <div class="section-heading"><span>Completed References</span><strong>${completed.length} sessions</strong></div>
        <div class="dashboard-compact-grid">
          ${
            completed.length
              ? completed
                  .slice(-6)
                  .reverse()
                  .map(({ course, session }) => `
                    <article class="resource-card resource-card-compact" data-bookmark-course="${courses.indexOf(course)}">
                      <span class="detail-kicker">Course ${course.number}</span>
                      <strong>${session.title}</strong>
                      <small>${course.title} Â· ${memoryLine(session)}</small>
                    </article>
                  `)
                  .join("")
              : '<article class="note-card"><strong>No completed references yet</strong><small>Completed sessions will appear here for quick review.</small></article>'
          }
        </div>
      </section>
    </div>
  `;
}

function renderResourcesPage() {
  const course = currentCourse();
  const readings = normalizedReadingsForCourse(course);
  const glossaryTerms = glossaryTermsForCourse(course);
  const crosswayResources = courseCrosswayResources(course);
  const crosswayState = state.resources.byCourse[course.id];
  const linkedCount = crosswayResources.filter((source) => source.linked && source.pdfUrl).length;
  const autoMatchedCount = crosswayResources.filter((source) => source.linkedState === "auto").length;
  const missingCount = crosswayResources.filter((source) => source.linkedState === "missing").length;
  const totalReadings = courses.reduce((sum, item) => sum + readingsCount(item), 0);
  const totalLabs = courses.reduce((sum, item) => sum + item.sessions.reduce((inner, session) => inner + session.lab.length, 0), 0);
  ensureCrosswayResources(course);
  $("#resourcesView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Shepherd's Shelf</span><h2>Resources</h2></div>
        <strong>${crosswayResources.length ? `${linkedCount}/${crosswayResources.length} linked` : `${totalReadings} readings`}</strong>
      </div>
      <p class="view-intro">Everything for the selected course: reading list, linked Crossway PDFs, session memory, and core objectives.</p>
      ${dashboardFocusPanel({
        kicker: "Selected Course",
        title: course.title,
        description: course.description,
        metaItems: [
          `${readings.length} readings`,
          `${course.objectives.length} objectives`,
          `${glossaryTerms.length} glossary terms`,
          crosswayResources.length ? `${crosswayResources.length} Crossway sources` : "no Crossway sources yet",
        ],
        asideValue: `${linkedCount}/${crosswayResources.length || 0}`,
        asideLabel: crosswayResources.length ? (crosswayState?.libraryReady ? "PDF sources linked" : "linked sources available") : "Crossway shelf not curated yet",
      })}
      <section class="page-section">
        <div class="section-heading"><span>Course Shelves</span><strong>${courses.length} courses</strong></div>
        <div class="dashboard-compact-grid">
          ${courses
            .map((item) => {
              const itemCrossway = courseCrosswayResources(item);
              const itemReadings = normalizedReadingsForCourse(item);
              const itemGlossaryTerms = glossaryTermsForCourse(item);
              return `
                <article class="resource-card resource-card-compact" data-select-course="${courses.indexOf(item)}">
                  <span class="detail-kicker">Course ${String(item.number).padStart(2, "0")}${item.id === course.id ? " · Selected" : ""}</span>
                  <strong>${item.title}</strong>
                  <small>${itemReadings.length} readings · ${itemGlossaryTerms.length} glossary terms · ${itemCrossway.length} Crossway source${itemCrossway.length === 1 ? "" : "s"}</small>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
      <section class="page-section page-section-tight">
        <div class="dashboard-strip dashboard-metrics-row dashboard-metrics-row-3">
          ${dashboardMetricMarkup("Crossway", crosswayResources.length, "sources in this course")}
          ${dashboardMetricMarkup("Linked", linkedCount, crosswayResources.length ? (autoMatchedCount ? `${autoMatchedCount} auto-matched` : "explicit paths preferred") : "waiting for source curation")}
          ${dashboardMetricMarkup("Unmapped", missingCount, crosswayResources.length ? (crosswayState?.libraryReady ? "titles still needing a PDF path" : "library not connected") : "no PDF titles assigned")}
        </div>
        <article class="resource-library-panel">
          <div>
            <span class="detail-kicker">Crossway Library</span>
            <strong>${crosswayState?.libraryReady ? "Connected" : "Waiting for library"}</strong>
            <small>${crosswayState?.libraryReady ? escapeHtml(crosswayState.libraryRoot || "") : "Point the app at your local Crossway folder to enable inline PDF reading."}</small>
          </div>
          <div class="resource-library-meta">
            <span class="dashboard-meta-pill">${linkedCount} linked</span>
            <span class="dashboard-meta-pill">${missingCount} not linked</span>
          </div>
        </article>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Readings</span><strong>${readings.length} items</strong></div>
        <div class="resource-shelf-grid">
          ${readings
            .map((reading) => `
              <article class="resource-card resource-book-card">
                <div class="resource-book-cover ${readingCoverUrl(reading) ? "has-cover" : ""}">
                  ${
                    readingCoverUrl(reading)
                      ? `<img src="${escapeHtml(readingCoverUrl(reading))}" alt="${escapeHtml(reading.title)} cover" loading="lazy" />`
                      : `<span>${escapeHtml((reading.title || "Reading").split(" ").slice(0, 3).join(" "))}</span>`
                  }
                </div>
                <div class="resource-book-copy">
                  <span class="detail-kicker">Required Reading</span>
                  <strong>${escapeHtml(reading.title)}</strong>
                  <small>${escapeHtml(reading.author || course.category)}</small>
                  ${reading.notes ? `<p class="resource-inline-copy">${escapeHtml(reading.notes)}</p>` : ""}
                </div>
              </article>
            `)
            .join("")}
        </div>
      </section>
      ${
        crosswayResources.length
          ? `
            <section class="page-section">
              <div class="section-heading"><span>Crossway Library Sources</span><strong>${crosswayResources.length} sources</strong></div>
              <div class="dashboard-compact-grid">
                ${crosswayResources
                  .map((source) => `
                    <article class="resource-card resource-card-compact resource-source-card" data-resource-open="${escapeHtml(source.key)}">
                      <div class="compact-card-top">
                        <span class="detail-kicker">Crossway Source</span>
                        <strong>${source.linkedState === "linked" ? "PDF" : source.linkedState === "auto" ? "Auto" : "--"}</strong>
                      </div>
                      <div class="resource-source-copy">
                        <strong>${escapeHtml(source.title)}</strong>
                        <small>${escapeHtml(source.author || "Lecture support text")}</small>
                        <p class="resource-inline-copy">${escapeHtml(source.summary || "Open the modal to read or inspect the mapped source.")}</p>
                      </div>
                      <div class="resource-source-footer">
                        <span class="dashboard-meta-pill">${
                          source.linkedState === "linked" ? "Linked PDF" : source.linkedState === "auto" ? "Auto-matched PDF" : "Not linked yet"
                        }</span>
                        ${
                          source.sessionNumbers?.length
                            ? `<span class="dashboard-meta-pill">Sessions ${source.sessionNumbers.join(", ")}</span>`
                            : ""
                        }
                      </div>
                    </article>
                  `)
                  .join("")}
              </div>
            </section>
          `
          : `
            <section class="page-section">
              <div class="section-heading"><span>Crossway Library Sources</span><strong>0 sources</strong></div>
              <article class="note-card">
                <strong>No Crossway sources curated yet</strong>
                <small>This course can still use the readings, objectives, and session memory shelves while PDF sources are added later.</small>
              </article>
            </section>
          `
      }
      <section class="page-section">
        <div class="section-heading"><span>Learning Objectives</span><strong>${course.objectives.length} aims</strong></div>
        <div class="dashboard-compact-grid">
          ${course.objectives
            .map((objective) => `
              <article class="resource-card resource-card-compact">
                <span class="detail-kicker">Objective</span>
                <strong>${objective}</strong>
                <small>${course.category}</small>
              </article>
            `)
            .join("")}
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Glossary</span><strong>${glossaryTerms.length} terms</strong></div>
        ${glossaryGridMarkup(glossaryTerms)}
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Scripture Memory</span><strong>${course.sessions.length} sessions</strong></div>
        <div class="dashboard-compact-grid">
          ${course.sessions
            .map((session) => `
              <article class="resource-card resource-card-compact" data-session="${session.number}">
                <span class="detail-kicker">Session ${session.number}</span>
                <strong>${memoryLine(session)}</strong>
                <small>${session.title}</small>
              </article>
            `)
            .join("")}
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Curriculum Totals</span><strong>${courses.length} courses</strong></div>
        <div class="dashboard-strip dashboard-metrics-row dashboard-metrics-row-3">
          ${dashboardMetricMarkup("Readings", totalReadings, "books and chapters")}
          ${dashboardMetricMarkup("Sessions", courses.length * 4, "lecture and lab blocks")}
          ${dashboardMetricMarkup("Labs", totalLabs, "research assignments")}
        </div>
      </section>
    </div>
  `;
}

function renderSchedulePageRedesign() {
  const course = currentCourse();
  const nextSession = nextSessionForCourse(course);
  const completed = completedSessionCount(course);
  const upcoming = shelfSlice(state.selectedCourse, 4).map((item, index) => ({
    course: item,
    session: nextSessionForCourse(item),
    date: [14, 16, 19, 23][index],
    day: ["Wed", "Fri", "Mon", "Fri"][index],
  }));
  const calendarDays = [
    27, 28, 29, 30, 1, 2, 3,
    4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 24,
    25, 26, 27, 28, 29, 30, 31,
    1, 2, 3, 4, 5, 6, 7,
  ];
  $("#scheduleView").innerHTML = `
    <div class="utility-page schedule-redesign">
      <header class="utility-heading">
        <h2>Schedule</h2>
        <p>Plan your study. Stay faithful. Shepherd well.</p>
      </header>
      <div class="schedule-layout">
        <main class="schedule-main">
          <section class="calendar-panel">
            <div class="calendar-toolbar">
              <div class="calendar-arrows">
                <button class="icon-button" type="button" data-schedule-shift="-1" aria-label="Previous month"><span data-icon="arrow-left"></span></button>
                <button class="icon-button" type="button" data-schedule-shift="1" aria-label="Next month"><span data-icon="arrow-right"></span></button>
                <button class="secondary-action" type="button">Today</button>
              </div>
              <strong>May 2025</strong>
              <div class="calendar-toggle"><button type="button">Week</button><button class="active" type="button">Month</button></div>
            </div>
            <div class="calendar-grid" aria-label="May study calendar">
              ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => `<span class="calendar-weekday">${day}</span>`).join("")}
              ${calendarDays
                .map((day, index) => {
                  const muted = index < 4 || index > 34;
                  const hasStudy = [4, 5, 6, 7, 12, 16, 19, 23, 26, 30].includes(day) && !muted;
                  return `<button class="calendar-day ${muted ? "muted" : ""} ${day === 14 && !muted ? "active" : ""}" type="button"><span>${day}</span>${hasStudy ? "<i></i>" : ""}</button>`;
                })
                .join("")}
            </div>
          </section>
          <section class="upcoming-panel">
            <div class="utility-section-heading"><h3>Upcoming Sessions</h3><button class="shelf-link" type="button">View full schedule <span data-icon="arrow-right"></span></button></div>
            <div class="upcoming-session-list">
              ${upcoming
                .map(({ course: itemCourse, session, date, day }) => `
                  <article class="upcoming-session-row" data-session-route="${sessionPath(itemCourse, session)}">
                    <time><span>May</span><strong>${date}</strong><small>${day}</small></time>
                    <span class="session-symbol">${String(itemCourse.number).padStart(2, "0")}</span>
                    <div>
                      <span>${escapeHtml(itemCourse.title)}</span>
                      <strong>Session ${session.number}: ${escapeHtml(session.title)}</strong>
                      <small>${escapeHtml(session.keyVerse || memoryLine(session))}</small>
                    </div>
                    <small class="session-duration">60 min</small>
                    <span data-icon="arrow-right"></span>
                  </article>
                `)
                .join("")}
            </div>
          </section>
        </main>
        <aside class="schedule-side">
          <section class="utility-card today-plan-card">
            <h3>Today's Plan</h3>
            <div class="today-plan-body">
              <span class="plan-medallion">♛</span>
              <div>
                <small>${escapeHtml(course.title)}</small>
                <strong>Session ${nextSession.number}: ${escapeHtml(nextSession.title)}</strong>
                <p>${escapeHtml(nextSession.keyVerse || memoryLine(nextSession))}</p>
              </div>
            </div>
            <dl class="plan-facts">
              <div><dt>Estimated Time</dt><dd>60 min</dd></div>
              <div><dt>Next Up</dt><dd>Read: ${escapeHtml((nextSession.keyVerse || "Psalm 99").split(";")[0])}</dd></div>
            </dl>
            <button class="primary-action" type="button" data-session-route="${sessionPath(course, nextSession)}"><span>Start Session</span></button>
            <button class="shelf-link" type="button" data-session-route="${sessionPath(course, nextSession)}">View Session Details <span data-icon="arrow-right"></span></button>
          </section>
          <section class="utility-card weekly-goal-card">
            <h3>Weekly Goal</h3>
            <div class="goal-ring-row">
              <div class="goal-ring"><strong>${Math.min(3, completed || 3)}</strong><span>of 5</span></div>
              <div><strong>Sessions This Week<br />${Math.min(3, completed || 3)} of 5</strong><small>Time Goal<br />3h of 5h</small></div>
            </div>
            <p>You're on track. Keep going.</p>
          </section>
          <section class="utility-card deadline-card">
            <h3>Upcoming Deadlines</h3>
            ${[
              ["May", "31", "Reflection Paper", course.title, "Due in 17 days"],
              ["Jun", "07", "Quiz: The Trinity", "The Trinity - One God, Three Persons", "Due in 24 days"],
              ["Jun", "14", "Reflection Paper", "The Gospel - Salvation by Grace", "Due in 31 days"],
            ]
              .map(([month, date, title, label, due]) => `<article><time><span>${month}</span><strong>${date}</strong></time><div><strong>${title}</strong><small>${label}</small><em>${due}</em></div></article>`)
              .join("")}
            <button class="shelf-link" type="button">View all deadlines <span data-icon="arrow-right"></span></button>
          </section>
        </aside>
      </div>
    </div>
  `;
}

function renderNotesPageRedesign() {
  const course = currentCourse();
  const noteItems = courses.flatMap((itemCourse) =>
    itemCourse.sessions.map((session) => ({
      course: itemCourse,
      session,
      title: session.title,
      tags: [itemCourse.category.split(" ")[0], `Session ${session.number}`, session.number % 2 ? "Reflection" : "Lecture"],
      body: session.keyVerse || session.lecture[0] || itemCourse.description,
    }))
  ).slice(0, 9);
  const selected = noteItems.find((item) => item.course.id === course.id) || noteItems[0];
  $("#notesView").innerHTML = `
    <div class="utility-page notes-redesign">
      <header class="utility-heading"><h2>Notes</h2></header>
      <div class="notes-app-panel">
        <aside class="notes-list-panel">
          <nav class="notes-tabs" aria-label="Note filters">
            <button class="active" type="button">All Notes</button>
            <button type="button">Course Notes</button>
            <button type="button">Lecture Notes</button>
            <button type="button">Reflections</button>
          </nav>
          <div class="notes-list-toolbar"><span>${noteItems.length} notes</span><span>Sort by: Newest</span></div>
          <div class="note-preview-list">
            ${noteItems
              .map((item, index) => `
                <article class="note-preview-card ${index === 0 ? "active" : ""}" data-session-route="${sessionPath(item.course, item.session)}">
                  <span class="note-doc-icon" data-icon="file-text"></span>
                  <div>
                    <strong>${escapeHtml(item.title)}</strong>
                    <small>${escapeHtml(item.course.category)} • Session ${item.session.number}</small>
                    <small>May ${21 - index}, 2025 • ${index === 0 ? "Saved" : "Draft"}</small>
                    <p>${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</p>
                  </div>
                  <span data-icon="bookmark"></span>
                </article>
              `)
              .join("")}
          </div>
        </aside>
        <article class="note-reader-panel">
          <span class="note-ribbon" data-icon="bookmark"></span>
          <div class="note-reader-actions" data-note-context data-note-course="${selected.course.id}" data-note-session="${selected.session.number}"><button data-note-action="export" data-icon="file-text" title="Export note" type="button"></button><button data-note-action="share" data-icon="share" title="Share note" type="button"></button><button data-note-action="more" data-icon="chevron-down" title="More options" type="button"></button></div>
          <h2>${escapeHtml(selected.title)}</h2>
          <div class="note-reader-meta">
            <span>${escapeHtml(selected.course.category)}</span>
            <span>Session ${selected.session.number}</span>
            <span>May 21, 2025</span>
            <span>Created: May 21, 2025</span>
          </div>
          <div class="note-tags">${selected.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}<button type="button">+ Add tag</button></div>
          <blockquote>${escapeHtml(selected.session.keyVerse || "Holy, holy, holy is the LORD of hosts; the whole earth is full of his glory.")}</blockquote>
          <ul>
            ${selected.session.lecture.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
          <section>
            <h3><span data-icon="book-open"></span> Scripture References</h3>
            <p>${escapeHtml(selected.session.keyVerse || "Isaiah 6:1-5; Psalm 99:1-5; Revelation 4:8; Leviticus 19:2")}</p>
          </section>
          <section>
            <h3><span data-icon="file-text"></span> Personal Reflection</h3>
            <p>${escapeHtml(state.notes[selected.course.id] || "The more I see God as He truly is, the more I see my need for grace. This note space keeps the lecture connected to worship, ministry, and daily obedience.")}</p>
          </section>
          <footer><span>Last edited: May 21, 2025 at 9:42 AM</span><span>Word count: ${wordCount(state.notes[selected.course.id] || selected.body)}</span><span>Auto-saved</span></footer>
        </article>
      </div>
    </div>
  `;
}

function renderResourcesPageRedesign() {
  const course = currentCourse();
  const readings = normalizedReadingsForCourse(course);
  const crosswayResources = courseCrosswayResources(course);
  ensureCrosswayResources(course);
  const allCards = [
    ...readings.map((reading) => ({ type: "Book", title: reading.title, author: reading.author || course.category, image: readingCoverUrl(reading), action: "Open", bookLabel: `${reading.title}${reading.author ? " — " + reading.author : ""}` })),
    ...crosswayResources.map((source) => ({ type: "PDF", title: source.title, author: source.author || course.title, action: source.pdfUrl ? "Open PDF" : "View", key: source.key, pdfUrl: source.pdfUrl, sessions: source.sessionNumbers || [] })),
    ...course.sessions.slice(0, 4).map((session) => ({ type: "PDF", title: `Lecture Notes - Session ${session.number}`, author: session.title, action: "Download", session })),
  ];
  const filterMap = {
    "Books": (item) => item.type === "Book",
    "PDFs": (item) => item.type === "PDF",
    "Audio": () => false,
    "Articles": () => false,
    "Downloads": (item) => item.action === "Download",
  };
  const filterFn = filterMap[state.resourceFilter];
  const cards = filterFn ? allCards.filter(filterFn) : allCards;
  const tabs = ["All Resources", "Books", "PDFs", "Audio", "Articles", "Downloads"];
  $("#resourcesView").innerHTML = `
    <div class="utility-page resources-redesign">
      <header class="utility-heading">
        <h2>Resources</h2>
        <p>Curated study materials to strengthen your understanding and equip your ministry.</p>
      </header>
      <div class="resource-tabs">
        ${tabs.map((tab) => `<button class="${tab === state.resourceFilter ? "active" : ""}" data-resource-filter="${escapeHtml(tab)}" type="button">${tab}</button>`).join("")}
        <button class="filter-button" type="button">Filters <span data-icon="chevron-down"></span></button>
      </div>
      <div class="resource-card-grid">
        ${cards.length ? cards
          .map((item) => `
            <article class="resource-tile" style="cursor:pointer" ${item.pdfUrl ? `data-pdf-href="${escapeHtml(item.pdfUrl)}"` : item.key ? `data-resource-open="${escapeHtml(item.key)}"` : item.session ? `data-session-route="${sessionPath(course, item.session)}"` : item.bookLabel ? `data-open-book="${escapeHtml(item.bookLabel)}"` : ""}>
              <div class="resource-tile-art ${item.type.toLowerCase()}">
                ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)} cover" loading="lazy" />` : `<span>${escapeHtml(item.title.split(" ").slice(0, 5).join(" "))}</span>`}
                <b>${item.type}</b>
                <button type="button" data-resource-bookmark aria-label="Bookmark resource"><span data-icon="bookmark"></span></button>
              </div>
              <div class="resource-tile-copy">
                <span>${escapeHtml(item.type)}</span>
                <strong>${escapeHtml(item.title)}</strong>
                <small>${escapeHtml(item.author || "Shepherd's Curriculum")}</small>
                ${item.sessions?.length ? `<span class="resource-tile-sessions">${item.sessions.map((n) => `Session ${n}`).join(" · ")}</span>` : ""}
              </div>
              ${item.pdfUrl
                ? `<a class="resource-tile-action" href="${escapeHtml(item.pdfUrl)}" target="_blank" rel="noopener">Open PDF <span data-icon="external-link"></span></a>`
                : `<button class="resource-tile-action" type="button">${escapeHtml(item.action)} <span data-icon="${item.action === "Download" ? "download" : "arrow-right"}"></span></button>`}
            </article>
          `)
          .join("") : `<p class="resource-footnote" style="grid-column:1/-1">No ${state.resourceFilter.toLowerCase()} available for this course yet.</p>`}
      </div>
      <p class="resource-footnote"><span data-icon="book-open"></span> More resources will be added throughout the curriculum.</p>
    </div>
  `;
}

function renderBookmarksPageRedesign() {
  const savedCourses = courses.filter((course) => state.bookmarks[course.id]);
  const displayCourses = savedCourses.length ? savedCourses : courses.slice(0, 6);
  const recentBookmarks = displayCourses.slice(0, 6).map((course, index) => {
    const session = course.sessions[index % course.sessions.length] || nextSessionForCourse(course);
    return {
      course,
      session,
      kind: ["Lecture Highlight", "Scripture Memory", "Session Note", "Catechism", "Reading Note", "Book Highlight"][index] || "Saved Item",
      icon: ["file-text", "book-open", "calendar", "bookmark", "file-text", "book-open"][index] || "bookmark",
      title: index === 1 ? session.keyVerse || "Isaiah 6:3" : index === 3 ? "Westminster Shorter Catechism Q1" : index === 5 ? `${normalizedReadingsForCourse(course)[0]?.title || course.title} - Chapter 3` : session.title,
      meta: index === 1 ? "Isaiah 6:1-5" : `${course.category} - Session ${session.number}`,
      tags: [course.category.split(" ")[0] || "Study", session.number ? `Session ${session.number}` : "Reading", index % 2 ? "Memory" : "Highlight"],
      savedDate: `May ${21 - index}, 2025`,
    };
  });
  const bookmarkFilterMap = {
    "Scripture": (item) => item.kind === "Scripture Memory",
    "Notes": (item) => item.kind.includes("Note") || item.kind.includes("Highlight"),
    "Courses": () => true,
    "Resources": (item) => item.kind === "Book Highlight",
  };
  const bookmarkFilterFn = bookmarkFilterMap[state.bookmarkFilter];
  const filteredBookmarks = bookmarkFilterFn ? recentBookmarks.filter(bookmarkFilterFn) : recentBookmarks;
  const featured = filteredBookmarks[0] || recentBookmarks[0];
  const related = filteredBookmarks.slice(1, 4);
  const pathSessions = (featured?.course.sessions || currentCourse().sessions).slice(0, 3);
  const courseGroups = displayCourses.slice(0, 3);

  $("#bookmarksView").innerHTML = `
    <div class="utility-page bookmarks-redesign">
      <header class="utility-heading">
        <h2>Bookmarks</h2>
        <p>Your saved verses, notes, lectures, and resources for easy access.</p>
      </header>
      <div class="bookmarks-layout">
        <main class="bookmarks-main">
          <section class="bookmark-list-panel">
            <div class="bookmark-tabs">
              ${["All", "Scripture", "Notes", "Courses", "Resources"].map((tab) => `<button class="${tab === state.bookmarkFilter ? "active" : ""}" data-bookmark-filter="${escapeHtml(tab)}" type="button">${tab}</button>`).join("")}
              <span>Sort by: Recently Added <span data-icon="chevron-down"></span></span>
              <button type="button" aria-label="Filter bookmarks"><span data-icon="folder"></span></button>
            </div>
            <div class="bookmark-list-heading"><h3>Recent Bookmarks</h3></div>
            <div class="bookmark-row-list">
              ${filteredBookmarks.length ? filteredBookmarks
                .map((item, index) => `
                  <article class="bookmark-row ${index === 0 ? "active" : ""}" data-session-route="${sessionPath(item.course, item.session)}">
                    <span class="bookmark-row-icon" data-icon="${item.icon}"></span>
                    <div class="bookmark-row-copy">
                      <strong>${escapeHtml(item.title)}</strong>
                      <small>${escapeHtml(item.kind)} &bull; ${escapeHtml(item.meta)}</small>
                      <p>${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</p>
                    </div>
                    <time><span>Saved</span>${escapeHtml(item.savedDate)}</time>
                    <span class="bookmark-row-saved" data-icon="bookmark"></span>
                    <span data-icon="arrow-right"></span>
                  </article>
                `)
                .join("") : `<p style="padding:1rem;color:var(--text-muted,#888)">No ${state.bookmarkFilter.toLowerCase()} bookmarks saved yet.</p>`}
            </div>
            <section class="bookmark-course-strip">
              <div class="utility-section-heading">
                <h3>By Course</h3>
                <button class="shelf-link" type="button" data-view="library">View all courses <span data-icon="arrow-right"></span></button>
              </div>
              <div class="bookmark-course-list">
                ${courseGroups
                  .map((course) => `
                    <article data-bookmark-course="${courses.indexOf(course)}">
                      <span class="session-symbol">${String(course.number).padStart(2, "0")}</span>
                      <div><strong>${escapeHtml(course.category)}</strong><small>${Math.max(1, completedSessionCount(course) || course.sessions.length - 2)} bookmarks</small></div>
                    </article>
                  `)
                  .join("")}
              </div>
            </section>
          </section>
        </main>
        <aside class="bookmark-detail-column">
          <section class="bookmark-detail-card">
            <div class="bookmark-detail-kicker">
              <span class="bookmark-row-icon" data-icon="${featured?.icon || "bookmark"}"></span>
              <span>${escapeHtml(featured?.kind || "Lecture Highlight")}</span>
              <span class="bookmark-detail-flag" data-icon="bookmark"></span>
            </div>
            <h3>${escapeHtml(featured?.title || "The Holiness and Greatness of God")}</h3>
            <div class="bookmark-detail-meta">
              <span>${escapeHtml(featured?.course.category || "Systematic Theology")}</span>
              <span>Session ${featured?.session.number || 1}</span>
              <span>${escapeHtml(featured?.savedDate || "May 21, 2025")} at 9:42 AM</span>
            </div>
            <div class="note-tags">
              ${(featured?.tags || ["God", "Holiness", "Attributes"]).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
              <button type="button">+ Add tag</button>
            </div>
            <blockquote>${escapeHtml(featured?.session.keyVerse || "Holy, holy, holy is the LORD of hosts; the whole earth is full of his glory!")}</blockquote>
            <p>${escapeHtml(featured?.session.lecture?.[0] || featured?.course.description || "This saved highlight keeps an important lecture insight ready for review and teaching preparation.")}</p>
            <button class="primary-action" type="button" data-session-route="${featured ? sessionPath(featured.course, featured.session) : sessionPath(currentCourse(), nextSessionForCourse(currentCourse()))}">
              <span>Open in Lesson</span>
              <span data-icon="arrow-right"></span>
            </button>
            <div class="bookmark-detail-actions">
              <button class="secondary-action" type="button" data-view="notes"><span>Add Note</span></button>
              ${
                featured && state.bookmarks[featured.course.id]
                  ? `<button class="secondary-action" type="button" data-bookmark-remove="${courses.indexOf(featured.course)}"><span>Remove Bookmark</span></button>`
                  : `<button class="secondary-action" type="button" data-course-route="${featured ? coursePath(featured.course) : coursePath(currentCourse())}"><span>View Course</span></button>`
              }
            </div>
          </section>
          <div class="bookmark-side-grid">
            <section class="bookmark-small-card reading-path-card">
              <h3>Reading Path</h3>
              ${pathSessions
                .map((session, index) => `
                  <article class="${index === 0 ? "active" : ""}" data-session-route="${featured ? sessionPath(featured.course, session) : sessionPath(currentCourse(), session)}">
                    <span></span>
                    <div><strong>${escapeHtml(session.title)}</strong><small>Session ${session.number}</small></div>
                  </article>
                `)
                .join("")}
              <button class="shelf-link" type="button" data-course-route="${featured ? coursePath(featured.course) : coursePath(currentCourse())}">View full path <span data-icon="arrow-right"></span></button>
            </section>
            <section class="bookmark-small-card related-bookmark-card">
              <h3>Related Bookmarks</h3>
              ${related
                .map((item) => `
                  <article data-session-route="${sessionPath(item.course, item.session)}">
                    <span class="bookmark-row-icon" data-icon="${item.icon}"></span>
                    <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.kind)}</small></div>
                  </article>
                `)
                .join("")}
              <button class="shelf-link" type="button">View all related <span data-icon="arrow-right"></span></button>
            </section>
          </div>
        </aside>
      </div>
    </div>
  `;
}

function renderSupplementalViews() {
  renderProgressPage();
  renderSchedulePageRedesign();
  renderNotesPageRedesign();
  renderBookmarksPageRedesign();
  renderResourcesPageRedesign();
  renderIcons();
}

function setView(view) {
  state.view = view;
  document.body.dataset.activeView = view;
  if (view !== "resources" && state.resources.activeSourceKey) closeResourceModal();
  document.querySelectorAll(".view").forEach((node) => node.classList.remove("active-view"));
  $(`#${view}View`)?.classList.add("active-view");
  document.querySelectorAll(".nav-item").forEach((node) => node.classList.toggle("active", node.dataset.view === view));
  if (view !== "session") renderSupplementalViews();
}

function applyRoute(route = routeForPath()) {
  if (route.type === "session") {
    state.selectedCourse = courses.indexOf(route.course);
    renderCourse();
    renderSupplementalViews();
    renderSessionPage(route.course, route.session);
    setView("session");
    resetRouteScroll();
    return;
  }
  if (route.type === "course") {
    state.selectedCourse = courses.indexOf(route.course);
    renderCourse();
    renderSupplementalViews();
    renderCourseDetailPage(route.course);
    setView("session");
    resetRouteScroll();
    return;
  }
  setView(route.view || "library");
  resetRouteScroll();
}

function sessionSectionNavMarkup(course, session) {
  const glossary = sessionGlossaryConfig(course, session);
  const totalWorkspaceItems = (session.quiz?.length || 0) + fallbackReflectionPrompts(session).length + fallbackResearchTasks(session).length;
  return `
    <nav class="session-section-nav" aria-label="Session sections">
      <a class="session-section-tab active" data-section-tab="session-lecture" href="#session-lecture">Lecture<span class="session-section-count">${session.lectureSections?.length || session.lecture.length}</span></a>
      ${glossary ? `<a class="session-section-tab" data-section-tab="session-glossary" href="#session-glossary">${glossary.navLabel}<span class="session-section-count">${glossary.terms.length}</span></a>` : ""}
      <a class="session-section-tab" data-section-tab="session-workspace" href="#session-workspace">Workspace<span class="session-section-count">${totalWorkspaceItems} items</span></a>
    </nav>
  `;
}

function sessionCompletionStripMarkup(course, session, next, complete) {
  return `
    <section class="session-completion-strip">
      <div>
        <span class="detail-kicker">${complete ? "Complete" : "In Progress"}</span>
        <strong>${complete ? "Session marked complete" : "Finish this session and move forward"}</strong>
        <p>${next ? `Next recommended step: Session ${next.number} ${next.title}.` : "Return to the course hub for review and resources."}</p>
      </div>
      <div class="session-completion-actions">
        <button class="primary-action ${complete ? "is-complete-action" : ""}" data-complete="${session.number}" data-complete-course="${courses.indexOf(course)}" type="button">
          <span>${complete ? "Completed" : "Mark Complete"}</span>
          <span data-icon="${complete ? "check" : "bookmark"}"></span>
        </button>
        ${next ? `<button class="secondary-action" type="button" data-session-route="${sessionPath(course, next)}"><span>Open Next Session</span><span data-icon="arrow-right"></span></button>` : ""}
      </div>
    </section>
  `;
}

function fallbackSessionMarkup(course, session, includeHeading = true) {
  return `
    ${includeHeading ? `<span class="detail-kicker">Course ${course.number} &middot; Session ${session.number}</span><h2>${session.title}</h2>` : ""}
    <section id="session-lecture">${detailSection("Lecture", session.lecture)}</section>
    <section id="session-reflection">${detailSection("Reading & Reflection", session.reflection)}</section>
    <section id="session-lab">${detailSection("Lab / Research", session.lab)}</section>
    ${sessionGlossarySectionMarkup(course, session)}
    ${studyWorkspaceMarkup(course, session)}
  `;
}

function sessionDetailMarkup(course, session, includeHeading = true) {
  return session.lectureHtml ? detailedSessionMarkup(course, session, includeHeading) : fallbackSessionMarkup(course, session, includeHeading);
}

function renderCourseDetailPage(course) {
  const next = nextSessionForCourse(course);
  const completeCount = completedSessionCount(course);
  const complete = completeCount === course.sessions.length;
  const parts = courseDisplayParts(course);
  $("#sessionView").innerHTML = `
    <article class="course-detail-page">
      <div class="reference-breadcrumb">
        <button class="bare-back" type="button" data-view="library"><span data-icon="arrow-left"></span></button>
        <span>My Library</span>
        <span data-icon="arrow-right"></span>
        <strong>Course ${String(course.number).padStart(2, "0")}</strong>
      </div>

      <section class="course-hero-page">
        <div class="course-hero-cover">
          ${bookCoverMarkup(course)}
        </div>
        <div class="course-hero-copy">
          <span class="detail-kicker">Course ${String(course.number).padStart(2, "0")}</span>
          <h2>${escapeHtml(parts.title)}<br /><span>- ${escapeHtml(parts.subtitle)}</span></h2>
          <p>${escapeHtml(course.description)}</p>
          <div class="course-meta-row">
            <span><span data-icon="book-open"></span>${course.sessions.length} Sessions</span>
            <span><span data-icon="calendar"></span>${escapeHtml(course.format || "Self-paced")}</span>
            <span><span data-icon="chart"></span>~ ${escapeHtml(course.estimatedTime || "4-6 hours")}</span>
          </div>
          <div class="course-hero-actions">
            <button class="primary-action" type="button" data-session-route="${sessionPath(course, next)}">
              <span>Continue Course</span>
              <span data-icon="arrow-right"></span>
            </button>
            <button class="icon-button ${state.bookmarks[course.id] ? "active" : ""}" data-course-action="bookmark" type="button" aria-label="Bookmark course">
              <span data-icon="bookmark"></span>
            </button>
            <button class="icon-button" data-course-action="share" type="button" aria-label="Share course"><span data-icon="share"></span></button>
            <button class="icon-button" data-course-action="download" type="button" aria-label="Download course"><span data-icon="download"></span></button>
          </div>
        </div>
      </section>

      <section class="course-sessions-table">
        <div class="course-sessions-head">
          <h3>Sessions</h3>
          <span>${completeCount} / ${course.sessions.length} completed</span>
        </div>
        <div class="session-table-list">
          ${course.sessions
            .map((session) => {
              const done = Boolean(state.completed[sessionKey(course, session)]);
              return `
                <article class="session-table-row" data-session-route="${sessionPath(course, session)}">
                  <button class="tiny-button ${done ? "done" : ""}" data-complete="${session.number}" data-complete-course="${courses.indexOf(course)}" type="button" aria-label="Mark session complete">
                    <span data-icon="${done ? "check" : "bookmark"}"></span>
                  </button>
                  <span>${String(session.number).padStart(2, "0")}</span>
                  <strong>${escapeHtml(session.title)}</strong>
                  <small>${done ? "Completed" : session.number === next.number && !complete ? "In progress" : "Not started"}</small>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    </article>
  `;
  renderIcons($("#sessionView"));
}

function sessionProgressPanelMarkup(course, session) {
  const currentIndex = course.sessions.indexOf(session);
  const completeCount = completedSessionCount(course);
  const sessionBooks = courseCrosswayResources(course).filter((src) => src.sessionNumbers.includes(session.number));
  return `
    <aside class="session-side-panel">
      <section class="session-progress-card">
        <h3>Session Progress</h3>
        <p>${completeCount} of ${course.sessions.length} completed</p>
        <div class="progress-bar"><span style="width:${Math.round((completeCount / course.sessions.length) * 100)}%"></span></div>
        <div class="session-step-list">
          ${["Lecture", "Reading & Reflection", "Lab / Research"]
            .map((label, index) => `
              <article class="session-step ${index === 0 ? "is-current" : ""}">
                <span>${index === 0 ? `<span data-icon="check"></span>` : ""}</span>
                <strong>${String(index + 1).padStart(2, "0")}</strong>
                <div>
                  <b>${label}</b>
                  <small>${index === 0 ? (state.completed[sessionKey(course, session)] ? "Completed" : "In progress") : "Not started"}</small>
                </div>
              </article>
            `)
            .join("")}
        </div>
      </section>
      <section class="session-resources-card">
        <h3>Resources</h3>
        <div class="session-resource-list">
          <article>
            <span data-icon="file-text"></span>
            <div><strong>Lecture Notes</strong><small>${session.lectureSections?.length || session.lecture.length} sections</small></div>
            <button class="tiny-button" type="button" data-download-lecture="${course.id}:${session.number}"><span data-icon="download"></span></button>
          </article>
          ${sessionBooks.length
            ? sessionBooks.map((book) => `
              <article>
                <span data-icon="book-open"></span>
                <div><strong>${escapeHtml(book.title)}</strong><small>${escapeHtml(book.author || "Crossway")}</small></div>
                ${book.pdfUrl
                  ? `<a class="tiny-button" href="${escapeHtml(book.pdfUrl)}" target="_blank" rel="noopener"><span data-icon="external-link"></span></a>`
                  : `<button class="tiny-button" type="button" data-view="resources"><span data-icon="arrow-right"></span></button>`}
              </article>
            `).join("")
            : `
              <article>
                <span data-icon="book-open"></span>
                <div><strong>Further Reading</strong><small>See Resources tab</small></div>
                <button class="tiny-button" type="button" data-view="resources"><span data-icon="arrow-right"></span></button>
              </article>
            `}
        </div>
      </section>
      <section class="session-verse-card">
        <p>${escapeHtml(session.keyVerse || "The fear of the LORD is the beginning of knowledge.")}</p>
        <strong>${session.keyVerse ? "Memory Verse" : "Proverbs 1:7"}</strong>
      </section>
    </aside>
  `;
}

function renderSessionPage(course, session) {
  const currentIndex = course.sessions.indexOf(session);
  const previous = course.sessions[currentIndex - 1];
  const next = course.sessions[currentIndex + 1];
  const complete = Boolean(state.completed[sessionKey(course, session)]);

  $("#sessionView").innerHTML = `
    <article class="session-page lecture-layout-page">
      <div class="reference-breadcrumb">
        <span>My Library</span>
        <span data-icon="arrow-right"></span>
        <button type="button" data-course-route="${coursePath(course)}">${escapeHtml(courseDisplayParts(course).title)}</button>
        <span data-icon="arrow-right"></span>
        <strong>Session ${String(session.number).padStart(2, "0")}</strong>
      </div>
      <div class="lecture-page-grid">
        <main class="lecture-main">
          <div class="lecture-session-actions">
            <button class="secondary-action ${complete ? "is-complete-action" : ""}" data-complete="${session.number}" data-complete-course="${courses.indexOf(course)}" type="button">
              <span>${complete ? "Completed" : "Mark as Complete"}</span>
              <span data-icon="${complete ? "check" : "bookmark"}"></span>
            </button>
          </div>
          <header class="lecture-title-block">
            <span class="detail-kicker">Course ${String(course.number).padStart(2, "0")} &nbsp;&nbsp; Session ${String(session.number).padStart(2, "0")}</span>
            <h2>${escapeHtml(session.title)}</h2>
            <p>${escapeHtml(course.title)}</p>
          </header>
          ${sessionSectionNavMarkup(course, session)}
          <div class="session-page-content">
            ${sessionDetailMarkup(course, session, false)}
            <div class="lecture-bottom-nav">
              <button class="secondary-action" type="button" ${previous ? `data-session-route="${sessionPath(course, previous)}"` : "disabled"}>
                <span data-icon="arrow-left"></span>
                <span>Previous</span>
              </button>
              ${next ? `<button class="primary-action" type="button" data-session-route="${sessionPath(course, next)}"><span>Next: ${escapeHtml(next.title)}</span><span data-icon="arrow-right"></span></button>` : ""}
            </div>
            ${sessionCompletionStripMarkup(course, session, next, complete)}
          </div>
        </main>
        ${sessionProgressPanelMarkup(course, session)}
      </div>
    </article>
  `;
  renderIcons($("#sessionView"));
  ["session-reflection", "session-lab", "session-glossary", "session-workspace"].forEach((id) => {
    const section = document.getElementById(id);
    if (section) section.style.display = "none";
  });
  ensureCrosswayResources(course).then(() => {
    const panel = document.querySelector(".session-resources-card");
    if (panel) {
      panel.outerHTML = sessionProgressPanelMarkup(course, session).match(/<section class="session-resources-card">[\s\S]*?<\/section>/)?.[0] || panel.outerHTML;
      renderIcons(document.querySelector(".session-resources-card"));
    }
  });
}

function showSession(sessionNumber) {
  const course = currentCourse();
  const session = course.sessions.find((item) => item.number === Number(sessionNumber));
  if (!session) return;
  closeResourceModal();
  navigateTo(sessionPath(course, session));
}

function detailedSessionMarkup(course, session, includeHeading = true) {
  const glossary = sessionGlossaryConfig(course, session);
  return `
    ${includeHeading ? `<span class="detail-kicker">Course ${course.number} &middot; Session ${session.number}</span><h2>${session.title}</h2>${session.keyVerse ? `<blockquote class="key-verse">${session.keyVerse}</blockquote>` : ""}` : ""}
    <section id="session-lecture" class="detail-section lecture-reader">
      <div class="section-heading"><span>Lecture</span><strong>${session.lectureSections?.length || 0} sections</strong></div>
      ${lectureOverviewMarkup(session, glossary?.terms.length || 0)}
      ${session.lectureHtml}
    </section>
    <section id="session-reflection" class="detail-section lecture-reader">
      <div class="section-heading"><span>Reading & Reflection</span><strong>${session.reflection.length} prompts</strong></div>
      ${session.reflectionHtml || `<ul>${session.reflection.map((item) => `<li>${item}</li>`).join("")}</ul>`}
    </section>
    <section id="session-lab" class="detail-section lecture-reader">
      <div class="section-heading"><span>Lab / Research</span><strong>${session.lab.length} tasks</strong></div>
      ${session.labHtml || `<ul>${session.lab.map((item) => `<li>${item}</li>`).join("")}</ul>`}
    </section>
    ${sessionGlossarySectionMarkup(course, session)}
    ${studyWorkspaceMarkup(course, session)}
  `;
}

function quizKey(course, session) {
  return `${course.id}:session-${session.number}`;
}

function quizMarkup(course, session) {
  const key = quizKey(course, session);
  const total = session.quiz.length;
  const latestAttempt = latestQuizAttempt(course, session);
  return `
    <section class="detail-section lecture-reader quiz-panel" data-quiz-course="${course.number}" data-quiz-session="${session.number}">
      <div class="section-heading"><span>Memory Check</span><strong>${total} questions</strong></div>
      <p class="quiz-intro">Answer these before marking the lecture complete. The score is for your own review.</p>
      ${
        latestAttempt
          ? `<p class="quiz-saved">Last saved score: ${latestAttempt.score}/${latestAttempt.total_questions} on ${new Date(`${latestAttempt.created_at}Z`).toLocaleString()}</p>`
          : ""
      }
      <div class="quiz-list">
        ${session.quiz
          .map((question, questionIndex) => `
            <article class="quiz-card" data-quiz-question="${questionIndex}">
              <strong>${questionIndex + 1}. ${question.prompt}</strong>
              <div class="quiz-options">
                ${question.options
                  .map((option, optionIndex) => `
                    <button type="button" class="quiz-option" data-quiz-key="${key}" data-quiz-question="${questionIndex}" data-quiz-option="${optionIndex}">
                      <span>${String.fromCharCode(65 + optionIndex)}</span>
                      ${option}
                    </button>
                  `)
                  .join("")}
              </div>
              <p class="quiz-feedback" aria-live="polite"></p>
            </article>
          `)
          .join("")}
      </div>
      <div class="quiz-result" data-quiz-result="${key}">Choose an answer for each question.</div>
    </section>
  `;
}

function fallbackReflectionPrompts(session) {
  if (session.reflectionPrompts?.length) return session.reflectionPrompts;
  const questionLike = session.reflection.filter((item) => /\?|reflection prompt|reflect:/i.test(item));
  return questionLike.length
    ? questionLike
    : ["What did this reading clarify, challenge, or strengthen in your understanding of this lecture?"];
}

function fallbackResearchTasks(session) {
  if (session.researchTasks?.length) return session.researchTasks;
  const taskLike = session.lab.filter((item) => /\?|write|design|analy[sz]e|research|journal|draft|summar/i.test(item));
  return taskLike.length
    ? taskLike
    : session.lab.length
    ? session.lab
    : ["Develop one research or writing response that applies this lecture to ministry, discipleship, or church life."];
}

function studyWorkspaceMarkup(course, session) {
  const reflectionPrompts = fallbackReflectionPrompts(session);
  const researchTasks = fallbackResearchTasks(session);
  return `
    <section id="session-workspace" class="detail-section lecture-reader study-workspace">
      <div class="section-heading"><span>Study Workspace</span><strong>${state.databaseReady ? "SQLite autosave" : "Start local server to save"}</strong></div>
      ${session.quiz?.length ? quizMarkup(course, session) : ""}
      ${reflectionPrompts.length ? `
        <div class="workspace-block">
          <div class="section-heading compact-heading"><span>Reading Reflection</span><strong>${reflectionPrompts.length} prompt${reflectionPrompts.length === 1 ? "" : "s"}</strong></div>
          <p class="workspace-intro">Capture doctrinal clarity, tension points, and pastoral implications while the reading is still fresh.</p>
          ${reflectionPrompts.map((prompt, index) => {
            const saveId = `reflection-${course.id}-${session.number}-${index}`;
            return `
              <div class="study-qa">
                <p class="study-question"><span class="study-field-index">Prompt ${index + 1}</span>${escapeHtml(prompt)}</p>
                <div class="study-field-head"><small data-save-status="${saveId}">Autosaves while you type</small></div>
                <textarea
                  class="note-input study-textarea"
                  data-study-type="reflection"
                  data-save-id="${saveId}"
                  data-course-id="${course.id}"
                  data-session-number="${session.number}"
                  data-index="${index}"
                  data-prompt-text="${escapeHtml(prompt)}"
                  placeholder="Write your reflection here..."
                >${escapeHtml(getReflection(course, session, index))}</textarea>
              </div>
            `;
          }).join("")}
        </div>
      ` : ""}
      ${researchTasks.length ? `
        <div class="workspace-block">
          <div class="section-heading compact-heading"><span>Research & Writing</span><strong>${researchTasks.length} task${researchTasks.length === 1 ? "" : "s"}</strong></div>
          <p class="workspace-intro">Shape one ministry-ready draft at a time with a working title, then develop the argument beneath it.</p>
          ${researchTasks.map((task, index) => {
            const saveId = `draft-${course.id}-${session.number}-${index}`;
            const draft = getDraft(course, session, index);
            return `
              <div class="study-qa">
                <p class="study-question"><span class="study-field-index">Task ${index + 1}</span>${escapeHtml(task)}</p>
                <div class="study-field-head"><small data-save-status="${saveId}">Autosaves while you type</small></div>
                <input
                  class="draft-title"
                  data-study-type="draft-title"
                  data-draft-title="${saveId}"
                  data-save-id="${saveId}"
                  data-course-id="${course.id}"
                  data-session-number="${session.number}"
                  data-index="${index}"
                  data-task-text="${escapeHtml(task)}"
                  value="${escapeHtml(draft.title || "")}"
                  placeholder="Draft title"
                />
                <textarea
                  class="note-input study-textarea"
                  data-study-type="draft-body"
                  data-draft-body="${saveId}"
                  data-save-id="${saveId}"
                  data-course-id="${course.id}"
                  data-session-number="${session.number}"
                  data-index="${index}"
                  data-task-text="${escapeHtml(task)}"
                  placeholder="Work on your research or writing here..."
                >${escapeHtml(draft.body || "")}</textarea>
              </div>
            `;
          }).join("")}
        </div>
      ` : ""}
    </section>
  `;
}

async function saveQuizAttempt(course, session, panel) {
  const answers = Array.from(panel.querySelectorAll(".quiz-card")).map((card, questionIndex) => {
    const selected = card.querySelector(".quiz-option.selected");
    const optionIndex = selected ? Number(selected.dataset.quizOption) : null;
    const question = session.quiz[questionIndex];
    return {
      questionIndex,
      prompt: question.prompt,
      selectedIndex: optionIndex,
      correctIndex: question.answerIndex,
      correct: optionIndex === question.answerIndex,
    };
  });
  const score = answers.filter((answer) => answer.correct).length;
  await apiRequest("/api/quiz-attempts", {
    method: "POST",
    body: JSON.stringify({
      courseId: course.id,
      sessionNumber: session.number,
      score,
      totalQuestions: session.quiz.length,
      answers,
    }),
  });
  const payload = await apiRequest("/api/study-data");
  normalizeStudyData(payload);
  renderSupplementalViews();
}

function handleQuizOption(button) {
  const course = courses.find((item) => item.number === Number(button.closest("[data-quiz-course]")?.dataset.quizCourse));
  const session = course?.sessions.find((item) => item.number === Number(button.closest("[data-quiz-session]")?.dataset.quizSession));
  if (!course || !session?.quiz) return;

  const questionIndex = Number(button.dataset.quizQuestion);
  const optionIndex = Number(button.dataset.quizOption);
  const question = session.quiz[questionIndex];
  const card = button.closest(".quiz-card");
  card.querySelectorAll(".quiz-option").forEach((option) => {
    option.classList.remove("selected", "correct", "incorrect");
    option.setAttribute("aria-pressed", "false");
  });
  button.classList.add("selected", optionIndex === question.answerIndex ? "correct" : "incorrect");
  button.setAttribute("aria-pressed", "true");

  const feedback = card.querySelector(".quiz-feedback");
  feedback.textContent = optionIndex === question.answerIndex ? `Correct. ${question.explanation}` : `Review this: ${question.explanation}`;

  const panel = button.closest(".quiz-panel");
  const answered = Array.from(panel.querySelectorAll(".quiz-card")).filter((item) => item.querySelector(".quiz-option.selected"));
  const correct = Array.from(panel.querySelectorAll(".quiz-option.correct")).length;
  const result = panel.querySelector(".quiz-result");
  if (answered.length === session.quiz.length) {
    result.textContent = `Score: ${correct}/${session.quiz.length}. Saving attempt...`;
    saveQuizAttempt(course, session, panel)
      .then(() => {
        result.textContent = `Saved score: ${correct}/${session.quiz.length}. ${correct === session.quiz.length ? "Ready to move on." : "Review the missed items, then try again."}`;
      })
      .catch(() => {
        result.textContent = `Score: ${correct}/${session.quiz.length}. Start the local database server to save attempts.`;
      });
  } else {
    result.textContent = `Answered ${answered.length}/${session.quiz.length}.`;
  }
}

function detailSection(title, items) {
  return `
    <section class="detail-section">
      <h3>${title}</h3>
      <ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
  `;
}

function toast(message) {
  let node = $(".toast");
  if (!node) {
    node = document.createElement("div");
    node.className = "toast";
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 1800);
}

function toggleCurrentCourseBookmark() {
  const course = currentCourse();
  state.bookmarks[course.id] = !state.bookmarks[course.id];
  saveState("shepherd-bookmarks", state.bookmarks);
  renderCourse();
  renderSupplementalViews();
  if (state.view === "session" && routeForPath().type === "course") renderCourseDetailPage(course);
}

async function shareCurrentCourse() {
  const course = currentCourse();
  const text = `${course.title} - ${course.description}`;
  try {
    if (navigator.share) await navigator.share({ title: course.title, text });
    else await navigator.clipboard.writeText(text);
    toast("Course summary copied");
  } catch {
    toast("Share cancelled");
  }
}

function downloadLectureNotes(course, session) {
  const lines = [
    `${course.title} — Session ${session.number}: ${session.title}`,
    "",
    ...(session.keyVerse ? [`Key Verse: ${session.keyVerse}`, ""] : []),
    ...(session.lectureSections?.flatMap((s) => [s.heading || "", s.body || s.content || "", ""].filter(Boolean)) || session.lecture.map((item) => item)),
    ...(session.reflection?.length ? ["", "Reflection", ...session.reflection] : []),
    ...(session.lab?.length ? ["", "Lab / Research", ...session.lab] : []),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${course.slug}-session-${session.number}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadCurrentCourse() {
  const course = currentCourse();
  const lines = [
    course.title,
    "",
    course.description,
    "",
    "Learning Objectives",
    ...course.objectives.map((item) => `- ${item}`),
    "",
    "Required Readings",
    ...normalizedReadingsForCourse(course).map((item) => `- ${item.title}${item.author ? ` - ${item.author}` : ""}`),
    ...(courseCrosswayResources(course).length
      ? ["", "Crossway Library Sources", ...courseCrosswayResources(course).map((item) => `- ${item.title}${item.author ? ` - ${item.author}` : ""}`)]
      : []),
    "",
    "Sessions",
    ...course.sessions.flatMap((session) => [
      `Session ${session.number}: ${session.title}`,
      ...(session.keyVerse ? [`  Key Verse: ${session.keyVerse}`] : []),
      ...(session.fullText ? [`  ${session.fullText}`] : session.lecture.map((item) => `  Lecture: ${item}`)),
      ...(!session.fullText ? session.reflection.map((item) => `  Reflection: ${item}`) : []),
      ...(!session.fullText ? session.lab.map((item) => `  Lab: ${item}`) : []),
      "",
    ]),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${course.slug}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("click", (event) => {
  const quizOption = event.target.closest("[data-quiz-option]");
  if (quizOption) {
    handleQuizOption(quizOption);
    return;
  }

  const sectionTab = event.target.closest("[data-section-tab]");
  if (sectionTab) {
    event.preventDefault();
    const targetId = sectionTab.dataset.sectionTab;
    sectionTab.closest(".session-section-nav")?.querySelectorAll(".session-section-tab").forEach((t) => t.classList.remove("active"));
    sectionTab.classList.add("active");
    ["session-lecture", "session-reflection", "session-lab", "session-glossary", "session-workspace"].forEach((id) => {
      const section = document.getElementById(id);
      if (section) section.style.display = id === targetId ? "" : "none";
    });
    return;
  }

  const resourceBookmarkBtn = event.target.closest("[data-resource-bookmark]");
  if (resourceBookmarkBtn) {
    event.stopPropagation();
    toast("Resource bookmarked");
    return;
  }

  const resourceFilterBtn = event.target.closest("[data-resource-filter]");
  if (resourceFilterBtn) {
    state.resourceFilter = resourceFilterBtn.dataset.resourceFilter;
    renderResourcesPageRedesign();
    renderIcons();
    return;
  }

  const bookmarkFilterBtn = event.target.closest("[data-bookmark-filter]");
  if (bookmarkFilterBtn) {
    state.bookmarkFilter = bookmarkFilterBtn.dataset.bookmarkFilter;
    renderBookmarksPageRedesign();
    renderIcons();
    return;
  }

  const downloadLectureBtn = event.target.closest("[data-download-lecture]");
  if (downloadLectureBtn) {
    event.stopPropagation();
    const [courseId, sessionNum] = downloadLectureBtn.dataset.downloadLecture.split(":");
    const c = courses.find((x) => x.id === courseId);
    const s = c?.sessions.find((x) => x.number === Number(sessionNum));
    if (c && s) downloadLectureNotes(c, s);
    return;
  }

  const noteActionBtn = event.target.closest("[data-note-action]");
  if (noteActionBtn) {
    const action = noteActionBtn.dataset.noteAction;
    const panel = noteActionBtn.closest("[data-note-context]");
    const c = courses.find((x) => x.id === panel?.dataset.noteCourse);
    const s = c?.sessions.find((x) => x.number === Number(panel?.dataset.noteSession));
    if (action === "export" && c && s) {
      downloadLectureNotes(c, s);
    } else if (action === "share") {
      const text = c && s ? `${c.title} — Session ${s.number}: ${s.title}` : "";
      if (navigator.share && text) navigator.share({ title: c?.title, text }).catch(() => {});
      else navigator.clipboard?.writeText(text).catch(() => {});
      toast("Note info copied");
    } else {
      toast("More options coming soon");
    }
    return;
  }

  const openBookTile = event.target.closest("[data-open-book]");
  if (openBookTile) {
    toast(openBookTile.dataset.openBook);
    return;
  }

  const pdfTile = event.target.closest("[data-pdf-href]");
  if (pdfTile && !event.target.closest("a[href]")) {
    window.open(pdfTile.dataset.pdfHref, "_blank", "noopener");
    return;
  }

  const courseAction = event.target.closest("[data-course-action]");
  if (courseAction) {
    if (courseAction.dataset.courseAction === "bookmark") toggleCurrentCourseBookmark();
    if (courseAction.dataset.courseAction === "share") shareCurrentCourse();
    if (courseAction.dataset.courseAction === "download") downloadCurrentCourse();
    return;
  }

  const nav = event.target.closest("[data-view]");
  if (nav) {
    if (window.location.pathname !== "/") history.pushState({}, "", "/");
    setView(nav.dataset.view);
    return;
  }

  const routeButton = event.target.closest("[data-session-route]");
  if (routeButton && !routeButton.disabled) {
    navigateTo(routeButton.dataset.sessionRoute);
    return;
  }

  const courseRouteButton = event.target.closest("[data-course-route]");
  if (courseRouteButton && !courseRouteButton.disabled) {
    navigateTo(courseRouteButton.dataset.courseRoute);
    return;
  }

  const selectCourseButton = event.target.closest("[data-select-course]");
  if (selectCourseButton) {
    const course = courses[Number(selectCourseButton.dataset.selectCourse)];
    if (!course) return;
    navigateTo(coursePath(course));
    return;
  }

  const courseButton = event.target.closest("[data-course]");
  if (courseButton && !event.target.closest("[data-course-route]")) {
    state.selectedCourse = Number(courseButton.dataset.course);
    if (window.location.pathname !== "/") history.pushState({}, "", "/");
    renderCourse();
    setView("library");
    return;
  }

  const scheduleCourseButton = event.target.closest("[data-schedule-course]");
  if (scheduleCourseButton) {
    state.selectedCourse = Number(scheduleCourseButton.dataset.scheduleCourse);
    renderCourse();
    renderSupplementalViews();
    setView("schedule");
    return;
  }

  const scheduleShiftButton = event.target.closest("[data-schedule-shift]");
  if (scheduleShiftButton) {
    const shift = Number(scheduleShiftButton.dataset.scheduleShift);
    state.selectedCourse = (state.selectedCourse + shift + courses.length) % courses.length;
    renderCourse();
    renderSupplementalViews();
    setView("schedule");
    return;
  }

  const notesCourseButton = event.target.closest("[data-notes-course]");
  if (notesCourseButton) {
    state.selectedCourse = Number(notesCourseButton.dataset.notesCourse);
    renderCourse();
    renderSupplementalViews();
    setView("notes");
    return;
  }

  const notesShiftButton = event.target.closest("[data-notes-shift]");
  if (notesShiftButton) {
    const shift = Number(notesShiftButton.dataset.notesShift);
    state.selectedCourse = (state.selectedCourse + shift + courses.length) % courses.length;
    renderCourse();
    renderSupplementalViews();
    setView("notes");
    return;
  }

  const bookmarkCourseButton = event.target.closest("[data-bookmark-course]");
  if (bookmarkCourseButton) {
    state.selectedCourse = Number(bookmarkCourseButton.dataset.bookmarkCourse);
    renderCourse();
    renderSupplementalViews();
    setView("bookmarks");
    return;
  }

  const bookmarkRemoveButton = event.target.closest("[data-bookmark-remove]");
  if (bookmarkRemoveButton) {
    const course = courses[Number(bookmarkRemoveButton.dataset.bookmarkRemove)];
    if (!course) return;
    state.bookmarks[course.id] = false;
    saveState("shepherd-bookmarks", state.bookmarks);
    if (currentCourse().id === course.id) {
      const remaining = courses.filter((item) => state.bookmarks[item.id]);
      if (remaining.length) state.selectedCourse = courses.indexOf(remaining[0]);
    }
    renderCourse();
    renderSupplementalViews();
    setView("bookmarks");
    return;
  }

  const resourceOpenButton = event.target.closest("[data-resource-open]");
  if (resourceOpenButton) {
    openResourceModal(resourceOpenButton.dataset.resourceOpen);
    return;
  }

  const closeResourceButton = event.target.closest("[data-close-resource-modal]");
  if (closeResourceButton) {
    closeResourceModal();
    return;
  }

  const completeButton = event.target.closest("[data-complete]");
  if (completeButton) {
    event.stopPropagation();
    const course = completeButton.dataset.completeCourse
      ? courses[Number(completeButton.dataset.completeCourse)]
      : currentCourse();
    const session = course.sessions.find((item) => item.number === Number(completeButton.dataset.complete));
    const key = sessionKey(course, session);
    state.completed[key] = !state.completed[key];
    saveState("shepherd-completed", state.completed);
    apiRequest("/api/progress", {
      method: "POST",
      body: JSON.stringify({ courseId: course.id, sessionNumber: session.number, completed: state.completed[key] }),
    }).catch(() => toast("Progress saved in browser only"));
    renderCourse();
    renderSupplementalViews();
    if (state.view === "session") renderSessionPage(course, session);
    return;
  }

  const globalSessionTarget = event.target.closest("[data-open-course-session]");
  if (globalSessionTarget && !event.target.closest("button")) {
    const [courseIndex, sessionNumber] = globalSessionTarget.dataset.openCourseSession.split(":").map(Number);
    state.selectedCourse = courseIndex;
    renderCourse();
    renderSupplementalViews();
    showSession(sessionNumber);
    return;
  }

  const sessionTarget = event.target.closest("[data-session]");
  if (sessionTarget && !event.target.closest("button")) showSession(sessionTarget.dataset.session);
});

document.addEventListener("input", (event) => {
  const studyField = event.target.closest("[data-study-type]");
  if (studyField) autosaveField(studyField);
});

$("#prevCourse").addEventListener("click", () => {
  state.selectedCourse = (state.selectedCourse - 1 + courses.length) % courses.length;
  navigateTo(coursePath(currentCourse()));
});

$("#nextCourse").addEventListener("click", () => {
  state.selectedCourse = (state.selectedCourse + 1) % courses.length;
  navigateTo(coursePath(currentCourse()));
});

$("#continueCourse").addEventListener("click", () => {
  if (state.query) {
    const result = primarySearchResult(state.query);
    if (!result?.course || !result?.session) {
      toast("No matching session to open");
      return;
    }
    state.selectedCourse = courses.indexOf(result.course);
    renderCourse();
    renderSupplementalViews();
    showSession(result.session.number);
    return;
  }
  const course = currentCourse();
  const next = course.sessions.find((session) => !state.completed[sessionKey(course, session)]) || course.sessions[0];
  showSession(next.number);
});

$("#bookmarkCourse").addEventListener("click", () => {
  toggleCurrentCourseBookmark();
});

$("#shareCourse").addEventListener("click", async () => {
  shareCurrentCourse();
});

$("#downloadCourse").addEventListener("click", () => {
  downloadCurrentCourse();
});

$("#searchInput").addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  if (state.query) {
    const result = primarySearchResult(state.query);
    if (result?.course) state.selectedCourse = courses.indexOf(result.course);
    if (window.location.pathname !== "/") history.pushState({}, "", "/");
    setView("library");
  }
  renderCourse();
  renderSupplementalViews();
});

$("#searchInput").addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.target.value = "";
    state.query = "";
    if (window.location.pathname !== "/") history.pushState({}, "", "/");
    renderCourse();
    renderSupplementalViews();
    setView("library");
    return;
  }

  if (event.key === "Enter" && state.query) {
    event.preventDefault();
    const result = primarySearchResult(state.query);
    if (!result?.course || !result?.session) {
      toast("No matching session to open");
      return;
    }
    state.selectedCourse = courses.indexOf(result.course);
    renderCourse();
    renderSupplementalViews();
    showSession(result.session.number);
  }
});

window.addEventListener("popstate", () => {
  applyRoute(routeForPath());
});

$("#resourceModal")?.addEventListener("click", (event) => {
  if (event.target === event.currentTarget) closeResourceModal();
});

function toggleNotificationsPanel() {
  let panel = $("#notificationsPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "notificationsPanel";
    panel.className = "notifications-panel";
    const recentCompleted = Object.entries(state.completed)
      .filter(([, v]) => v)
      .slice(-5)
      .reverse();
    const items = recentCompleted.length
      ? recentCompleted.map(([key]) => {
          const [courseId, sessionNum] = key.split(":");
          const course = courses.find((c) => c.id === courseId);
          const session = course?.sessions.find((s) => s.number === Number(sessionNum));
          return course && session ? `<li><strong>Session ${session.number} complete</strong><small>${course.title}</small></li>` : "";
        }).filter(Boolean).join("")
      : `<li class="notifications-empty">No notifications yet</li>`;
    panel.innerHTML = `
      <div class="notifications-header"><strong>Notifications</strong></div>
      <ul class="notifications-list">${items}</ul>
    `;
    $("[aria-label='Notifications']").insertAdjacentElement("afterend", panel);
  }
  const isOpen = panel.classList.contains("open");
  panel.classList.toggle("open", !isOpen);
}

function toggleProfilePanel() {
  let panel = $("#profilePanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "profilePanel";
    panel.className = "profile-panel";
    panel.innerHTML = `
      <ul class="profile-menu">
        <li><button type="button" data-profile-action="profile">Edit Profile</button></li>
        <li><button type="button" data-profile-action="settings">Settings</button></li>
        <li><button type="button" data-profile-action="signout">Sign Out</button></li>
      </ul>
    `;
    $(".pastor-card").appendChild(panel);
  }
  const isOpen = panel.classList.contains("open");
  panel.classList.toggle("open", !isOpen);
}

document.addEventListener("click", (event) => {
  const profileAction = event.target.closest("[data-profile-action]");
  if (profileAction) {
    $("#profilePanel")?.classList.remove("open");
    toast(`${profileAction.dataset.profileAction === "signout" ? "Sign out" : profileAction.dataset.profileAction === "settings" ? "Settings" : "Edit profile"} — coming soon`);
    return;
  }
  if (!event.target.closest("[aria-label='Notifications']") && !event.target.closest("#notificationsPanel")) {
    $("#notificationsPanel")?.classList.remove("open");
  }
  if (!event.target.closest(".pastor-card") && !event.target.closest("#profilePanel")) {
    $("#profilePanel")?.classList.remove("open");
  }
});

$("[aria-label='Notifications']").addEventListener("click", () => toggleNotificationsPanel());
$(".pastor-card").addEventListener("click", () => toggleProfilePanel());

async function init() {
  await loadStudyData();
  renderIcons();
  renderCourse();
  renderSupplementalViews();
  applyRoute(routeForPath());
}

init();

