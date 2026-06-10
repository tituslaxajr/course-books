const supabase = require("../lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { courseId, sessionNumber, completed } = req.body || {};
  const isCompleted = Boolean(completed);

  const { error } = await supabase.from("progress").upsert(
    {
      course_id: String(courseId || ""),
      session_number: Number(sessionNumber),
      completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "course_id,session_number" }
  );

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ ok: true });
};
