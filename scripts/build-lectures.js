const fs = require("node:fs");
const path = require("node:path");

const workspace = path.resolve(__dirname, "..");
const lectureRoot = path.resolve(
  "C:/Users/huawei notebook/Desktop/Claude-Workspace/projects/Personal Courses/Lectures"
);

const courseConfigs = [
  {
    id: "course-1",
    number: 1,
    directory: "Course 01 - Who Is God",
    files: [
      "Session_01_Existence_and_Incomprehensibility.md",
      "Session_02_Holiness_and_Greatness.md",
      "Session_03_Sovereignty_and_Providence.md",
      "Session_04_Living_for_Gods_Glory.md",
    ],
  },
  {
    id: "course-2",
    number: 2,
    directory: "Course 02 - The Trinity",
    files: [
      "Session_01_Why_the_Trinity_Matters.md",
      "Session_02_The_Father_and_the_Son.md",
      "Session_03_The_Holy_Spirit.md",
      "Session_04_Living_Trinitarian.md",
    ],
  },
];

const quizzes = {
  "course-1": {
    1: [
      {
        prompt: "What does it mean to say we can know God truly but not exhaustively?",
        options: [
          "God has genuinely revealed Himself, but finite creatures cannot fully comprehend His infinite being.",
          "God can only be known through philosophical arguments, not Scripture.",
          "God is mostly unknowable, so theology should avoid clear claims.",
          "God is fully understandable once we learn enough doctrine.",
        ],
        answerIndex: 0,
        explanation:
          "The session holds together real revelation and creaturely limits: God is truly known because He speaks, but never totally mastered by finite minds.",
      },
      {
        prompt: "Which doctrine teaches that God depends on nothing outside Himself?",
        options: ["Providence", "Aseity", "Concurrence", "General revelation"],
        answerIndex: 1,
        explanation: "Aseity means God is self-existent and self-sufficient; creation adds nothing to Him.",
      },
      {
        prompt: "How should classical arguments for God's existence mainly be used in this session?",
        options: [
          "As conversation openers that show Christian belief is rationally coherent.",
          "As proofs that automatically produce saving faith.",
          "As replacements for Scripture and special revelation.",
          "As arguments useful only for Christians and never for unbelievers.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture treats the arguments as useful pointers and conversation starters, not stand-alone conversion tools.",
      },
    ],
    2: [
      {
        prompt: "What two dimensions of holiness must be held together?",
        options: [
          "Transcendent otherness and moral purity.",
          "Power and popularity.",
          "Mystery and confusion.",
          "Distance from creation and disinterest in creation.",
        ],
        answerIndex: 0,
        explanation: "Holiness means God is set apart as utterly other and perfectly pure.",
      },
      {
        prompt: "Why are God's incommunicable attributes pastorally important?",
        options: [
          "They show God is not limited like creatures and therefore is worthy of reverent trust.",
          "They make God less involved with ordinary life.",
          "They prove humans can become divine over time.",
          "They are mainly vocabulary for academic theology.",
        ],
        answerIndex: 0,
        explanation:
          "Attributes like omniscience, omnipotence, omnipresence, eternality, and immutability ground worship and confidence.",
      },
      {
        prompt: "What danger appears when worship emphasizes only God's nearness?",
        options: [
          "God may be treated casually, with little reverence for His holiness and greatness.",
          "Christians will become too afraid to pray.",
          "The church will reject God's love.",
          "Scripture memory will become impossible.",
        ],
        answerIndex: 0,
        explanation:
          "The session warns against reducing God to a friendly companion while losing awe before His holy majesty.",
      },
    ],
    3: [
      {
        prompt: "What does providence mean in this session?",
        options: [
          "God preserves, concurs with, and governs all things according to His wise purpose.",
          "God watches creation from a distance without involvement.",
          "God controls only spiritual events, not ordinary causes.",
          "God reacts to history after human choices surprise Him.",
        ],
        answerIndex: 0,
        explanation:
          "Providence includes preservation, concurrence, and government without making God the author of evil.",
      },
      {
        prompt: "What is concurrence?",
        options: [
          "God works through secondary causes without bypassing them.",
          "Human choices happen outside God's rule.",
          "God's will changes when circumstances change.",
          "Suffering always means God has withdrawn.",
        ],
        answerIndex: 0,
        explanation:
          "Concurrence says God's sovereign action and real creaturely action operate together in history.",
      },
      {
        prompt: "How should God's sovereignty shape suffering?",
        options: [
          "It anchors trust that suffering is not random, even when God's purposes are hidden.",
          "It removes the need to lament.",
          "It means evil actions are morally good.",
          "It guarantees Christians will understand every painful event immediately.",
        ],
        answerIndex: 0,
        explanation:
          "The doctrine gives ballast in suffering without pretending every purpose is immediately visible.",
      },
    ],
    4: [
      {
        prompt: "What is the chief end of man?",
        options: [
          "To glorify God and enjoy Him forever.",
          "To discover personal success and protect comfort.",
          "To earn God's approval through achievement.",
          "To divide life into sacred and secular categories.",
        ],
        answerIndex: 0,
        explanation:
          "The session culminates in the doxological end of all theology: God's glory and our joy in Him.",
      },
      {
        prompt: "What does Soli Deo Gloria require?",
        options: [
          "All of life is lived consciously for God's glory.",
          "Only church activities matter spiritually.",
          "Personal ambition is always sinful.",
          "Human relationships are irrelevant to worship.",
        ],
        answerIndex: 0,
        explanation:
          "Soli Deo Gloria refuses a sacred/secular divide and brings work, relationships, ambition, and digital life under God's glory.",
      },
      {
        prompt: "How are idols overcome in this session?",
        options: [
          "By a clearer, more captivating vision of God's glory.",
          "By pretending lesser glories are not attractive.",
          "By replacing doctrine with discipline only.",
          "By withdrawing from every ordinary responsibility.",
        ],
        answerIndex: 0,
        explanation:
          "The answer to glory-stealing idols is not mere effort, but seeing and worshiping the greater glory of God.",
      },
    ],
  },
  "course-2": {
    1: [
      {
        prompt: "What is the classic Trinitarian formula?",
        options: [
          "One God in three persons; one essence, three persons.",
          "Three gods united by one mission.",
          "One person appearing in three temporary modes.",
          "One supreme Father with two lesser divine helpers.",
        ],
        answerIndex: 0,
        explanation:
          "Orthodoxy confesses one divine essence shared fully by Father, Son, and Holy Spirit, with three distinct persons.",
      },
      {
        prompt: "Which heresy says Father, Son, and Spirit are only modes of one person?",
        options: ["Arianism", "Sabellianism or modalism", "Tritheism", "Pelagianism"],
        answerIndex: 1,
        explanation:
          "Modalism collapses the personal distinctions and cannot account for passages where the persons interact.",
      },
      {
        prompt: "Why is salvation Trinitarian?",
        options: [
          "The Father plans, the Son accomplishes, and the Spirit applies redemption.",
          "Each person saves a different kind of believer.",
          "The Spirit replaces the work of the Son after Pentecost.",
          "The Trinity is only a later explanation, not part of salvation.",
        ],
        answerIndex: 0,
        explanation:
          "The lecture frames redemption as Trinitarian from election to application and assurance.",
      },
    ],
    2: [
      {
        prompt: "What does eternal generation teach?",
        options: [
          "The Son is eternally begotten of the Father, not created in time.",
          "The Son became divine at the incarnation.",
          "The Father existed before the Son.",
          "The Son is a lesser divine being.",
        ],
        answerIndex: 0,
        explanation:
          "Eternal generation names the Son's eternal relation to the Father without making Him created or inferior.",
      },
      {
        prompt: "What did Chalcedon protect about Christ?",
        options: [
          "He is one person in two natures, truly God and truly man.",
          "He is two persons sharing one mission.",
          "His human nature replaced His divine nature.",
          "His deity was symbolic rather than real.",
        ],
        answerIndex: 0,
        explanation:
          "Chalcedon guards the unity of Christ's person and the integrity of His divine and human natures.",
      },
      {
        prompt: "Why does the Son's equality make His humility more stunning?",
        options: [
          "Because He had full divine glory and willingly humbled Himself for our salvation.",
          "Because He needed to earn divine status through obedience.",
          "Because He was naturally inferior to the Father.",
          "Because equality with God was only a future reward.",
        ],
        answerIndex: 0,
        explanation:
          "The humility of Philippians 2 is astonishing because the Son who serves is eternally equal with the Father.",
      },
    ],
    3: [
      {
        prompt: "Why must the Holy Spirit be understood as a person?",
        options: [
          "He speaks, grieves, teaches, intercedes, and knows the mind of God.",
          "He is an impersonal power believers can direct.",
          "He is only a symbol for spiritual emotion.",
          "He is a temporary replacement for Christ.",
        ],
        answerIndex: 0,
        explanation:
          "The Spirit's personal actions in Scripture show that He is a divine person, not a force.",
      },
      {
        prompt: "What is Spirit baptism in this session?",
        options: [
          "The Spirit's one-time act of uniting believers to Christ and His body at conversion.",
          "A second-tier experience for unusually mature Christians.",
          "A ritual that only happened before Pentecost.",
          "The same thing as repeated Spirit filling.",
        ],
        answerIndex: 0,
        explanation:
          "The session distinguishes once-for-all Spirit baptism from ongoing Spirit filling.",
      },
      {
        prompt: "What is one central work of the Spirit in the believer?",
        options: [
          "Union with Christ, from which every blessing flows.",
          "Replacing the written Word with private impressions.",
          "Making sanctification unnecessary.",
          "Removing the ordinary means of grace.",
        ],
        answerIndex: 0,
        explanation:
          "The Spirit unites believers to Christ and applies the benefits Christ purchased.",
      },
    ],
    4: [
      {
        prompt: "What shape should Christian prayer normally have?",
        options: [
          "To the Father, through the Son, in the power of the Spirit.",
          "Only to the Spirit, because He is closest to believers.",
          "To whichever person seems most useful at the moment.",
          "Without any Trinitarian structure.",
        ],
        answerIndex: 0,
        explanation:
          "Trinitarian prayer reflects the economy of salvation and Christian access to God.",
      },
      {
        prompt: "How does the Trinity shape Christian community?",
        options: [
          "Unity without uniformity and distinction without division.",
          "Uniformity as the only path to unity.",
          "Individual spirituality without church life.",
          "Hierarchy that treats some people as less valuable.",
        ],
        answerIndex: 0,
        explanation:
          "The triune life gives a pattern for diverse persons held together in love and unity.",
      },
      {
        prompt: "Why is mission Trinitarian?",
        options: [
          "The Father sends, the Son accomplishes redemption, and the Spirit empowers witness.",
          "Mission belongs only to pastors.",
          "Mission replaces worship as the church's final goal.",
          "The Spirit sends the church apart from Christ.",
        ],
        answerIndex: 0,
        explanation:
          "The church's mission flows from the sending God and is empowered by the Spirit for Christ's glory.",
      },
    ],
  },
};

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function normalize(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/â€”/g, "—")
    .replace(/â€“/g, "–")
    .replace(/â€˜/g, "‘")
    .replace(/â€™/g, "’")
    .replace(/â€œ/g, "“")
    .replace(/â€/g, "”")
    .replace(/Â·/g, "·")
    .replace(/ðŸ“–/g, "📖")
    .replace(/ðŸ“š/g, "📚")
    .replace(/ðŸ”¬/g, "🔬")
    .replace(/ðŸ“Ž/g, "📎")
    .replace(/â€¦/g, "…");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

function inlineMarkdown(value = "") {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function splitBlocks(markdown) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => block !== "---");
}

function tableHtml(block) {
  const rows = block
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim()));
  const filtered = rows.filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
  if (filtered.length < 2) return "";
  const [head, ...body] = filtered;
  return `<div class="detail-table-wrap"><table class="detail-table"><thead><tr>${head
    .map((cell) => `<th>${inlineMarkdown(cell)}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
}

function listHtml(lines) {
  const ordered = lines.every((line) => /^\d+\.\s+/.test(line));
  const tag = ordered ? "ol" : "ul";
  const items = lines.map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""));
  return `<${tag}>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${tag}>`;
}

function markdownToHtml(markdown) {
  const html = [];
  for (const block of splitBlocks(markdown)) {
    const lines = block.split("\n");
    if (/^#{1,6}\s+/.test(block)) {
      const heading = block.replace(/^#{1,6}\s+/, "");
      const level = Math.min(4, Math.max(3, block.match(/^#+/)[0].length));
      html.push(`<h${level}>${inlineMarkdown(heading)}</h${level}>`);
    } else if (lines.every((line) => line.trim().startsWith(">"))) {
      const quote = lines.map((line) => line.replace(/^>\s?/, "")).join("\n");
      html.push(`<blockquote class="detail-quote">${markdownToHtml(quote)}</blockquote>`);
    } else if (lines.every((line) => /^([-*]|\d+\.)\s+/.test(line.trim()))) {
      html.push(listHtml(lines.map((line) => line.trim())));
    } else if (lines.filter((line) => line.trim().startsWith("|")).length >= 2) {
      html.push(tableHtml(block));
    } else {
      html.push(`<p>${inlineMarkdown(block).replace(/\n/g, "<br />")}</p>`);
    }
  }
  return html.join("\n");
}

function textBetween(markdown, startPattern, endPattern) {
  const start = markdown.search(startPattern);
  if (start === -1) return "";
  const sliced = markdown.slice(start).replace(startPattern, "");
  const end = sliced.search(endPattern);
  return (end === -1 ? sliced : sliced.slice(0, end)).trim().replace(/^---\s*/m, "").trim();
}

function cleanSectionTitle(value) {
  return value.replace(/^#+\s*/, "").replace(/[📖📚🔬📎]/g, "").trim();
}

function bullets(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim());
}

function parseOverview(coursePath) {
  const markdown = normalize(readUtf8(path.join(coursePath, "00_Course_Overview.md")));
  const titleLine = markdown.match(/^#\s+(.+)$/m)?.[1] || "";
  const description = textBetween(markdown, /## Course Description\s*/, /\n---\n|## Learning Objectives/)
    .replace(/\n+/g, " ")
    .replace(/\*\*/g, "")
    .trim();
  const objectives = bullets(textBetween(markdown, /## Learning Objectives\s*/, /\n---\n|## Sessions/));
  const sourcesSection = textBetween(markdown, /## Crossway Library Sources for This Course\s*/, /\n---\n|## Personal Library|## How to Use/);
  const personalLibrary = bullets(textBetween(markdown, /## Personal Library[^]*?Assigned Readings\s*/, /\n---\n|## /));
  const sources = sourcesSection
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || (line.startsWith("|") && !/^\|\s*[-:]+\s*\|/.test(line)))
    .map((line) => {
      if (line.startsWith("-")) return line.replace(/^-\s+/, "");
      const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
      if (cells[0] === "Ebook") return "";
      return cells[0] && cells[1] ? `${cells[0]} — ${cells[1]}` : cells[0];
    })
    .filter(Boolean)
    .map((line) => line.replace(/\*\*/g, "").replace(/\*/g, ""));
  return {
    titleLine,
    description,
    objectives: objectives.map((line) => line.replace(/\*\*/g, "")),
    crosswaySources: sources,
    personalLibrary: personalLibrary.map((line) => line.replace(/\*/g, "")),
  };
}

function headingSections(markdown) {
  const matches = [...markdown.matchAll(/^###\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    return {
      heading: cleanSectionTitle(match[1]),
      body: markdown.slice(start, end).trim().replace(/^---\s*/m, "").trim(),
    };
  });
}

function firstHeading(markdown) {
  return markdown.match(/^#\s+(.+)$/m)?.[1] || "";
}

function parseKeyVerse(markdown) {
  return markdown.match(/Key Verse:\s*([^*]+)\*/)?.[1]?.trim() || "";
}

function parseLectureSources(markdown) {
  return markdown.match(/Lecture sources \(Crossway library\):\*\*\s*([^\n]+)/)?.[1]?.trim() || "";
}

function sectionAfter(markdown, pattern, endPattern = /\n---\n## /) {
  return textBetween(markdown, pattern, endPattern);
}

function extractReflectionPrompts(markdown) {
  const prompts = [];
  const reflectionMatches = [...markdown.matchAll(/(?:\*\*)?Reflection(?: prompt)?:(?:\*\*)?\s*([^\n]+)/gi)];
  for (const match of reflectionMatches) prompts.push(match[1].trim());
  return [...new Set(prompts.map((line) => line.replace(/^[-*]\s+/, "").replace(/\*\*/g, "")))];
}

function extractResearchTasks(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, "").replace(/\*\*/g, "").trim());
}

function extractMemory(section) {
  return section.match(/\*\*Memory verse:\*\*\s*([^\n]+)/i)?.[1]?.trim() || "";
}

function extractReadingAssignments(section) {
  const assigned = textBetween(section, /\*\*Assigned for this session:\*\*\s*/, /\n\n|\*\*Reflection prompt|\*\*Memory verse/);
  return bullets(assigned).map((line) => line.replace(/\*/g, ""));
}

function extractAppendixTerms(markdown) {
  const glossary = sectionAfter(markdown, /##\s+📎?\s*Key Terms[^\n]*\s*/, /$/);
  if (!glossary) return [];
  return glossary
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .slice(2)
    .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 2)
    .map(([term, definition]) => ({
      term: term.replace(/\*\*/g, ""),
      definition: definition.replace(/\*\*/g, ""),
    }));
}

function parseSession(courseId, filePath, number) {
  const markdown = normalize(readUtf8(filePath));
  const lectureContent = sectionAfter(markdown, /##\s+📖?\s*LECTURE[^\n]*\s*/, /\n---\n\n##\s+📖?\s*SCRIPTURE READING/);
  const scriptureSection = sectionAfter(markdown, /##\s+📖?\s*SCRIPTURE READING\s*/, /\n---\n\n##\s+📚?\s*EXTRA READING/);
  const readingSection = sectionAfter(markdown, /##\s+📚?\s*EXTRA READING[^\n]*\s*/, /\n---\n\n##\s+🔬?\s*LAB/);
  const labSection = sectionAfter(markdown, /##\s+🔬?\s*LAB[^\n]*\s*/, /\n---\n\n##\s+📎?\s*Key Terms|$/);
  const lectureSections = headingSections(lectureContent).map((section) => ({
    heading: section.heading,
    html: markdownToHtml(section.body),
    plainText: section.body.replace(/\*\*/g, "").replace(/\*/g, ""),
  }));
  const reflectionPrompts = extractReflectionPrompts(`${scriptureSection}\n${readingSection}`);
  const researchTasks = extractResearchTasks(labSection);
  const readingAssignments = extractReadingAssignments(readingSection);
  const memory = extractMemory(readingSection);
  const title = firstHeading(markdown).replace(/^Session\s+\d+:\s*/, "").trim();
  const appendixTerms = extractAppendixTerms(markdown);
  const lecturePreview = lectureSections.map((section) => section.heading);
  const reflection = [
    ...readingAssignments.map((item) => `Read: ${item}`),
    ...reflectionPrompts.map((item) => `Reflect: ${item}`),
    ...(memory ? [`Memorize: ${memory}`] : []),
  ];
  return {
    number,
    title,
    keyVerse: parseKeyVerse(markdown),
    lectureSources: parseLectureSources(markdown),
    lectureSections,
    lectureHtml: lectureSections
      .map((section) => `<section class="lecture-section"><h3>${inlineMarkdown(section.heading)}</h3>${section.html}</section>`)
      .join(""),
    reflectionHtml: markdownToHtml(`${scriptureSection}\n\n${readingSection}`),
    labHtml: markdownToHtml(labSection),
    appendixTerms,
    fullText: markdown.replace(/[#*_>`|–—-]/g, " ").replace(/\s+/g, " ").trim(),
    lecturePreview,
    lecture: lecturePreview,
    reflection,
    lab: researchTasks,
    reflectionPrompts,
    researchTasks,
    quiz: quizzes[courseId]?.[number] || [],
  };
}

function buildCourse(config) {
  const coursePath = path.join(lectureRoot, config.directory);
  const overview = parseOverview(coursePath);
  return {
    id: config.id,
    number: config.number,
    description: overview.description,
    objectives: overview.objectives,
    crosswaySources: overview.crosswaySources,
    personalLibrary: overview.personalLibrary,
    sessions: config.files.map((file, index) => parseSession(config.id, path.join(coursePath, file), index + 1)),
  };
}

const courses = courseConfigs.map(buildCourse);
const output = `// Generated by scripts/build-lectures.js from local markdown lecture files.\n(function () {\n  const lectureCourses = ${JSON.stringify(courses, null, 2)};\n  const data = window.SHEPHERD_CURRICULUM;\n  if (!data || !Array.isArray(data.courses)) return;\n\n  lectureCourses.forEach((lectureCourse) => {\n    const course = data.courses.find((item) => item.id === lectureCourse.id || item.number === lectureCourse.number);\n    if (!course) return;\n    course.description = lectureCourse.description || course.description;\n    course.objectives = lectureCourse.objectives?.length ? lectureCourse.objectives : course.objectives;\n    course.crosswaySources = lectureCourse.crosswaySources || [];\n    course.personalLibrary = lectureCourse.personalLibrary || [];\n    if (lectureCourse.number === 2) {\n      course.title = \"The Trinity - One God, Three Persons\";\n      course.category = \"The Trinity\";\n    }\n    course.sessions.forEach((session) => {\n      const detail = lectureCourse.sessions.find((item) => item.number === session.number);\n      if (!detail) return;\n      Object.assign(session, detail);\n    });\n  });\n})();\n`;

fs.writeFileSync(path.join(workspace, "course-lectures.js"), output, "utf8");
console.log(`Generated ${path.join(workspace, "course-lectures.js")}`);
