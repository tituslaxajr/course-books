const supabase = require("../lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { courseId, sessionNumber, promptKey, promptText, body } = req.body || {};

  const { error } = await supabase.from("reading_reflections").upsert(
    {
      course_id: String(courseId || ""),
      session_number: Number(sessionNumber),
      prompt_key: String(promptKey || ""),
      prompt_text: String(promptText || ""),
      body: String(body || ""),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "course_id,session_number,prompt_key" }
  );

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ ok: true });
};
