const supabase = require("../lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const [progress, courseNotes, reflections, drafts, quizAttempts] = await Promise.all([
    supabase.from("progress").select("*"),
    supabase.from("course_notes").select("*"),
    supabase.from("reading_reflections").select("*"),
    supabase.from("research_drafts").select("*"),
    supabase.from("quiz_attempts").select("*").order("created_at", { ascending: false }).order("id", { ascending: false }),
  ]);

  if (progress.error || courseNotes.error || reflections.error || drafts.error || quizAttempts.error) {
    const err = progress.error || courseNotes.error || reflections.error || drafts.error || quizAttempts.error;
    return res.status(500).json({ error: err.message });
  }

  res.status(200).json({
    progress: (progress.data || []).map((r) => ({ ...r, completed: r.completed ? 1 : 0 })),
    courseNotes: courseNotes.data || [],
    reflections: reflections.data || [],
    drafts: drafts.data || [],
    quizAttempts: (quizAttempts.data || []).map((r) => ({
      ...r,
      answers: Array.isArray(r.answers_json) ? r.answers_json : [],
      answers_json: undefined,
    })),
  });
};
