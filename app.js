const data = window.SHEPHERD_CURRICULUM;
const courses = data.courses;
const visuals = window.SHEPHERD_VISUALS || { courses: {}, sessions: {}, fallback: null };

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
  databaseReady: false,
};

const appRoutes = {
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

function courseVisual(course) {
  return visuals.courses?.[course.id] || visuals.fallback;
}

function sessionVisual(course, session) {
  return visuals.sessions?.[course.id]?.[session.number] || courseVisual(course) || visuals.fallback;
}

function visualCreditMarkup(visual) {
  if (!visual) return "";
  return `
    <small class="visual-credit">
      Photo:
      <a href="${escapeHtml(visual.sourceUrl || visual.creditUrl || "https://unsplash.com")}" target="_blank" rel="noreferrer">
        ${escapeHtml(visual.creditName || "Unsplash")}
      </a>
    </small>
  `;
}

function visualImageMarkup(visual, className = "visual-image") {
  if (!visual?.src) return '<div class="visual-placeholder" aria-hidden="true"></div>';
  return `
    <figure class="${className}">
      <img src="${escapeHtml(visual.src)}" alt="${escapeHtml(visual.alt || "")}" loading="lazy" onerror="this.closest('figure')?.classList.add('image-error'); this.remove();" />
      ${visualCreditMarkup(visual)}
    </figure>
  `;
}

function sessionPath(course, session) {
  return `/courses/${course.slug}/session-${session.number}`;
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
  return { type: "view", view: "library" };
}

function navigateTo(path) {
  if (window.location.pathname !== path) history.pushState({}, "", path);
  applyRoute(routeForPath(path));
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

function splitTitle(title) {
  const parts = title.split(" - ");
  if (parts.length > 1) return parts;
  return title.split(" \u2014 ");
}

function currentCourse() {
  return courses[state.selectedCourse];
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
  return courses.flatMap((course) =>
    course.sessions
      .filter((session) => includesTerms(sessionSearchText(course, session), query))
      .map((session) => ({ course, session }))
  );
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

function courseStudyStats(course) {
  const completed = completedSessionCount(course);
  const reflections = Object.values(state.study.reflections).filter((item) => item.course_id === course.id && item.body?.trim()).length;
  const drafts = Object.values(state.study.drafts).filter((item) => item.course_id === course.id && (item.title?.trim() || item.body?.trim())).length;
  const quizzes = state.study.quizAttempts.filter((item) => item.course_id === course.id);
  const latestQuiz = quizzes[0];
  return { completed, reflections, drafts, quizzes: quizzes.length, latestQuiz };
}

function selectedCourseButton(course) {
  const visual = courseVisual(course);
  return `
    <button class="course-row ${course === currentCourse() ? "active" : ""}" data-select-course="${courses.indexOf(course)}">
      <span class="course-number">${String(course.number).padStart(2, "0")}</span>
      <span>
        <strong>${course.title}</strong>
        <small>${course.description}</small>
        <small class="visual-theme">${escapeHtml(visual?.theme || course.category)}</small>
      </span>
      <span class="progress-pill">${courseProgress(course)}%</span>
    </button>
  `;
}

function renderCourse() {
  const course = currentCourse();
  const titleParts = splitTitle(course.title);

  $("#coverNumber").textContent = `Course ${course.number}`;
  $("#coverTitle").textContent = titleParts[0];
  $("#coverCategory").textContent = titleParts[1] || course.category;
  $("#courseEyebrow").textContent = `Course ${course.number} of ${courses.length}`;
  $("#courseVisual").innerHTML = visualImageMarkup(courseVisual(course), "course-visual-card");
  $("#courseTitle").textContent = course.title;
  $("#courseDescription").textContent = course.description;
  $("#courseAbout").textContent = `${course.description} Students complete four guided sessions with lecture notes, readings, reflection prompts, Scripture memory, and Philippine-context research labs.`;
  $("#factSessions").textContent = course.sessions.length;
  $("#factLevel").textContent = course.level;
  $("#factFormat").textContent = course.format;
  $("#factTime").textContent = course.estimatedTime;
  $("#factCategory").textContent = course.category;
  $("#factReadings").textContent = `${course.readings.length} books`;
  $("#sessionCount").textContent = `${course.sessions.length} sessions`;

  $("#bookmarkCourse").classList.toggle("active", Boolean(state.bookmarks[course.id]));
  renderCourseList();
  renderSessions();
}

function courseMatches(course, query) {
  if (!query) return true;
  const haystack = [
    course.title,
    course.description,
    course.category,
    ...course.objectives,
    ...course.readings,
    ...(course.crosswaySources || []),
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
      const visual = courseVisual(course);
      return `
        <button class="course-row ${index === state.selectedCourse ? "active" : ""}" data-course="${index}">
          <span class="course-number">${String(course.number).padStart(2, "0")}</span>
          <span>
            <strong>${course.title}</strong>
            <small>${state.query ? `${matchingSessionsForCourse(course, state.query).length} matching sessions · ${course.description}` : course.description}</small>
            <small class="visual-theme">${escapeHtml(visual?.theme || course.category)}</small>
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
  const sessions = state.query ? matchingSessions(state.query) : course.sessions.map((session) => ({ course, session }));
  $("#sessionCount").textContent = state.query
    ? `${sessions.length} matching session${sessions.length === 1 ? "" : "s"}`
    : `${course.sessions.length} sessions`;
  $("#sessionList").innerHTML = sessions
    .map(({ course: itemCourse, session }) => {
      const owningIndex = courses.indexOf(itemCourse);
      const done = Boolean(state.completed[sessionKey(itemCourse, session)]);
      const visual = sessionVisual(itemCourse, session);
      const attempts = state.study.quizAttempts.filter((item) => item.course_id === itemCourse.id && Number(item.session_number) === session.number);
      const reflections = Object.values(state.study.reflections).filter((item) => item.course_id === itemCourse.id && Number(item.session_number) === session.number && item.body?.trim()).length;
      const drafts = Object.values(state.study.drafts).filter((item) => item.course_id === itemCourse.id && Number(item.session_number) === session.number && (item.title?.trim() || item.body?.trim())).length;
      return `
        <article class="session-card" ${state.query ? `data-open-course-session="${owningIndex}:${session.number}"` : `data-session="${session.number}"`}>
          <div class="session-card-visual" aria-hidden="true">
            <img src="${escapeHtml(visual?.src || "")}" alt="" loading="lazy" onerror="this.closest('.session-card-visual')?.classList.add('image-error'); this.remove();" />
          </div>
          <div class="session-top">
            <div>
              <span class="session-index">${state.query ? `Course ${itemCourse.number} · ` : ""}Session ${session.number}</span>
              <strong>${session.title}</strong>
              <small>${session.reflection.find((line) => line.startsWith("Memorize:")) || escapeHtml(visual?.theme || "Guided lecture, reading, and lab")}</small>
            </div>
            <div class="session-actions">
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
        </article>
      `;
    })
    .join("") || '<article class="note-card"><strong>No session matches</strong><small>Search terms are matched against full lecture notes, reflection prompts, research tasks, Scripture, readings, and glossary terms.</small></article>';
  renderIcons($("#sessionList"));
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
              <article class="progress-card">
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
            <article class="progress-card">
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

function renderResourcesView() {
  const course = currentCourse();
  $("#resourcesView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div>
          <span>Shepherd's Shelf</span>
          <h2>Resources</h2>
        </div>
        <strong>${course.readings.length} readings</strong>
      </div>
      <p class="view-intro">${course.title}</p>
      <div class="resource-grid">
        ${course.readings
          .map(
            (reading) => `
            <article class="resource-card">
              <strong>${reading}</strong>
              <small>Required reading for this course</small>
            </article>
          `
          )
          .join("")}
      </div>
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
  $("#progressView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Formation Track</span><h2>My Progress</h2></div>
        <strong>${state.databaseReady ? "SQLite live" : "Browser only"}</strong>
      </div>
      <p class="view-intro">Track completed sessions, quiz attempts, reflections, notes, and research drafts from the local SQLite study database.</p>
      <div class="dashboard-strip">
        <article class="metric-card"><span>Overall</span><strong>${overall}%</strong><small>${doneSessions} completed sessions</small></article>
        <article class="metric-card"><span>Quiz Average</span><strong>${quizAttempts.length ? `${quizAverage}%` : "—"}</strong><small>${quizAttempts.length} saved attempt${quizAttempts.length === 1 ? "" : "s"}</small></article>
        <article class="metric-card"><span>Study Work</span><strong>${reflections.length + drafts.length + notes.length}</strong><small>${reflections.length} reflections · ${drafts.length} drafts · ${notes.length} notes</small></article>
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
              <small>${stats.completed} of ${item.sessions.length} sessions · ${stats.quizzes} quizzes · ${stats.reflections} reflections · ${stats.drafts} drafts</small>
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

function renderSchedulePage() {
  const course = currentCourse();
  $("#scheduleView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Self-paced Plan</span><h2>Schedule</h2></div>
        <strong>12 weeks</strong>
      </div>
      <p class="view-intro">A steady path assigns one course per week and four sessions across the week. The current course plan updates when a different course is selected.</p>
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

function renderNotesPage() {
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
      <p class="view-intro">Review saved course notes, reading reflections, research drafts, and quiz history for the selected course.</p>
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

function renderBookmarksPage() {
  const bookmarked = courses.filter((course) => state.bookmarks[course.id]);
  const completed = allCompletedSessions();
  $("#bookmarksView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Saved Courses</span><h2>Bookmarks</h2></div>
        <strong>${bookmarked.length} saved</strong>
      </div>
      <p class="view-intro">Bookmarked courses stay here for fast access during mentoring, lesson planning, or personal study.</p>
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

function renderResourcesPage() {
  const course = currentCourse();
  const totalReadings = courses.reduce((sum, item) => sum + item.readings.length, 0);
  const totalLabs = courses.reduce((sum, item) => sum + item.sessions.reduce((inner, session) => inner + session.lab.length, 0), 0);
  $("#resourcesView").innerHTML = `
    <div class="view-panel">
      <div class="view-title">
        <div><span>Shepherd's Shelf</span><h2>Resources</h2></div>
        <strong>${totalReadings} readings</strong>
      </div>
      <p class="view-intro">Resources update with the selected course and collect the readings, objectives, Scripture memory, and labs needed for preparation.</p>
      <section class="current-course-panel">
        <div><span class="detail-kicker">Selected Course</span><h3>${course.title}</h3><p>${course.description}</p></div>
        <strong>${course.readings.length} books</strong>
      </section>
      <div class="resource-grid">
        ${course.readings
          .map((reading) => `
            <article class="resource-card">
              <strong>${reading}</strong>
              <small>Required reading for this course</small>
            </article>
          `)
          .join("")}
      </div>
      ${
        course.crosswaySources?.length
          ? `
            <section class="page-section">
              <div class="section-heading"><span>Crossway Library Sources</span><strong>${course.crosswaySources.length} sources</strong></div>
              <div class="resource-grid">
                ${course.crosswaySources
                  .map((source) => `
                    <article class="resource-card">
                      <strong>${source}</strong>
                      <small>Lecture source for Course 1</small>
                    </article>
                  `)
                  .join("")}
              </div>
            </section>
          `
          : ""
      }
      <section class="page-section">
        <div class="section-heading"><span>Learning Objectives</span><strong>${course.objectives.length} aims</strong></div>
        <div class="resource-grid">
          ${course.objectives
            .map((objective) => `
              <article class="resource-card">
                <strong>${objective}</strong>
                <small>${course.category}</small>
              </article>
            `)
            .join("")}
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Scripture Memory</span><strong>${course.sessions.length} sessions</strong></div>
        <div class="resource-grid">
          ${course.sessions
            .map((session) => `
              <article class="resource-card" data-session="${session.number}">
                <strong>${memoryLine(session)}</strong>
                <small>${session.title}</small>
              </article>
            `)
            .join("")}
        </div>
      </section>
      <section class="page-section">
        <div class="section-heading"><span>Curriculum Totals</span><strong>${courses.length} courses</strong></div>
        <div class="dashboard-strip">
          <article class="metric-card"><span>Readings</span><strong>${totalReadings}</strong><small>books and chapters</small></article>
          <article class="metric-card"><span>Sessions</span><strong>${courses.length * 4}</strong><small>lecture and lab blocks</small></article>
          <article class="metric-card"><span>Labs</span><strong>${totalLabs}</strong><small>research assignments</small></article>
        </div>
      </section>
    </div>
  `;
}

function renderSupplementalViews() {
  renderProgressPage();
  renderSchedulePage();
  renderNotesPage();
  renderBookmarksPage();
  renderResourcesPage();
}

function setView(view) {
  state.view = view;
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
    return;
  }
  setView(route.view || "library");
}

function fallbackSessionMarkup(course, session, includeHeading = true) {
  return `
    ${includeHeading ? `<span class="detail-kicker">Course ${course.number} &middot; Session ${session.number}</span><h2>${session.title}</h2>` : ""}
    ${detailSection("Lecture", session.lecture)}
    ${detailSection("Reading & Reflection", session.reflection)}
    ${detailSection("Lab / Research", session.lab)}
    ${studyWorkspaceMarkup(course, session)}
  `;
}

function sessionDetailMarkup(course, session, includeHeading = true) {
  return session.lectureHtml ? detailedSessionMarkup(course, session, includeHeading) : fallbackSessionMarkup(course, session, includeHeading);
}

function renderSessionPage(course, session) {
  const visual = sessionVisual(course, session);
  const currentIndex = course.sessions.indexOf(session);
  const previous = course.sessions[currentIndex - 1];
  const next = course.sessions[currentIndex + 1];
  const complete = Boolean(state.completed[sessionKey(course, session)]);

  $("#sessionView").innerHTML = `
    <article class="session-page">
      <div class="session-page-nav">
        <button class="secondary-action" type="button" data-back-course>
          <span data-icon="arrow-left"></span>
          <span>Back to Course</span>
        </button>
        <div class="session-page-nav-group">
          <button class="icon-button" type="button" ${previous ? `data-session-route="${sessionPath(course, previous)}"` : "disabled"} aria-label="Previous session">
            <span data-icon="arrow-up"></span>
          </button>
          <button class="icon-button" type="button" ${next ? `data-session-route="${sessionPath(course, next)}"` : "disabled"} aria-label="Next session">
            <span data-icon="arrow-down"></span>
          </button>
          <button class="icon-button ${complete ? "active" : ""}" data-complete="${session.number}" data-complete-course="${courses.indexOf(course)}" type="button" aria-label="Mark session complete">
            <span data-icon="${complete ? "check" : "bookmark"}"></span>
          </button>
        </div>
      </div>
      <header class="session-hero">
        <div class="session-hero-copy">
          <span class="detail-kicker">Course ${course.number} &middot; Session ${session.number}</span>
          <h2>${session.title}</h2>
          <p>${course.title}</p>
          ${session.keyVerse ? `<blockquote class="key-verse">${session.keyVerse}</blockquote>` : ""}
        </div>
        ${visualImageMarkup(visual, "session-hero-visual")}
      </header>
      <div class="session-page-content">
        ${sessionDetailMarkup(course, session, false)}
      </div>
    </article>
  `;
  renderIcons($("#sessionView"));
}

function showSession(sessionNumber) {
  const course = currentCourse();
  const session = course.sessions.find((item) => item.number === Number(sessionNumber));
  if (!session) return;
  navigateTo(sessionPath(course, session));
}

function detailedSessionMarkup(course, session, includeHeading = true) {
  return `
    ${includeHeading ? `<span class="detail-kicker">Course ${course.number} &middot; Session ${session.number}</span><h2>${session.title}</h2>${session.keyVerse ? `<blockquote class="key-verse">${session.keyVerse}</blockquote>` : ""}` : ""}
    <section class="detail-section lecture-reader">
      <div class="section-heading"><span>Lecture</span><strong>${session.lectureSections?.length || 0} sections</strong></div>
      ${session.lectureHtml}
    </section>
    <section class="detail-section lecture-reader">
      <div class="section-heading"><span>Reading & Reflection</span><strong>${session.reflection.length} prompts</strong></div>
      ${session.reflectionHtml || `<ul>${session.reflection.map((item) => `<li>${item}</li>`).join("")}</ul>`}
    </section>
    <section class="detail-section lecture-reader">
      <div class="section-heading"><span>Lab / Research</span><strong>${session.lab.length} tasks</strong></div>
      ${session.labHtml || `<ul>${session.lab.map((item) => `<li>${item}</li>`).join("")}</ul>`}
    </section>
    ${
      session.appendixTerms?.length
        ? `
          <section class="detail-section lecture-reader">
            <div class="section-heading"><span>Appendix</span><strong>${session.appendixTerms.length} terms</strong></div>
            <div class="term-grid">
              ${session.appendixTerms
                .map((item) => `
                  <article class="term-card">
                    <strong>${item.term}</strong>
                    <small>${item.definition}</small>
                  </article>
                `)
                .join("")}
            </div>
          </section>
        `
        : ""
    }
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
    <section class="detail-section lecture-reader study-workspace">
      <div class="section-heading"><span>Study Workspace</span><strong>${state.databaseReady ? "SQLite autosave" : "Start local server to save"}</strong></div>
      ${session.quiz?.length ? quizMarkup(course, session) : ""}
      <div class="workspace-grid">
        <div class="workspace-panel">
          <div class="section-heading compact-heading"><span>Reading Reflection</span><strong>${reflectionPrompts.length} prompts</strong></div>
          ${reflectionPrompts
            .map((prompt, index) => {
              const saveId = `reflection-${course.id}-${session.number}-${index}`;
              return `
                <label class="study-field">
                  <span>${escapeHtml(prompt)}</span>
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
                  <small data-save-status="${saveId}">Autosaves while you type</small>
                </label>
              `;
            })
            .join("")}
        </div>
        <div class="workspace-panel">
          <div class="section-heading compact-heading"><span>Research & Writing</span><strong>${researchTasks.length} tasks</strong></div>
          ${researchTasks
            .map((task, index) => {
              const saveId = `draft-${course.id}-${session.number}-${index}`;
              const draft = getDraft(course, session, index);
              return `
                <article class="draft-editor">
                  <p>${escapeHtml(task)}</p>
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
                  <small data-save-status="${saveId}">Autosaves while you type</small>
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
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

document.addEventListener("click", (event) => {
  const quizOption = event.target.closest("[data-quiz-option]");
  if (quizOption) {
    handleQuizOption(quizOption);
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

  const backCourse = event.target.closest("[data-back-course]");
  if (backCourse) {
    navigateTo("/");
    return;
  }

  const selectCourseButton = event.target.closest("[data-select-course]");
  if (selectCourseButton) {
    state.selectedCourse = Number(selectCourseButton.dataset.selectCourse);
    if (window.location.pathname !== "/") history.pushState({}, "", "/");
    renderCourse();
    renderSupplementalViews();
    setView("library");
    return;
  }

  const courseButton = event.target.closest("[data-course]");
  if (courseButton) {
    state.selectedCourse = Number(courseButton.dataset.course);
    if (window.location.pathname !== "/") history.pushState({}, "", "/");
    renderCourse();
    setView("library");
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
  renderCourse();
});

$("#nextCourse").addEventListener("click", () => {
  state.selectedCourse = (state.selectedCourse + 1) % courses.length;
  renderCourse();
});

$("#continueCourse").addEventListener("click", () => {
  const course = currentCourse();
  const next = course.sessions.find((session) => !state.completed[sessionKey(course, session)]) || course.sessions[0];
  showSession(next.number);
});

$("#bookmarkCourse").addEventListener("click", () => {
  const course = currentCourse();
  state.bookmarks[course.id] = !state.bookmarks[course.id];
  saveState("shepherd-bookmarks", state.bookmarks);
  renderCourse();
  renderSupplementalViews();
});

$("#shareCourse").addEventListener("click", async () => {
  const course = currentCourse();
  const text = `${course.title} - ${course.description}`;
  try {
    if (navigator.share) await navigator.share({ title: course.title, text });
    else await navigator.clipboard.writeText(text);
    toast("Course summary copied");
  } catch {
    toast("Share cancelled");
  }
});

$("#downloadCourse").addEventListener("click", () => {
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
    ...course.readings.map((item) => `- ${item}`),
    ...(course.crosswaySources?.length ? ["", "Crossway Library Sources", ...course.crosswaySources.map((item) => `- ${item}`)] : []),
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
});

$("#searchInput").addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  renderCourseList();
  renderSessions();
});

window.addEventListener("popstate", () => {
  applyRoute(routeForPath());
});

async function init() {
  await loadStudyData();
  renderIcons();
  renderCourse();
  renderSupplementalViews();
  applyRoute(routeForPath());
}

init();
