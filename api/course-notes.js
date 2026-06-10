const supabase = require("../lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { courseId, body } = req.body || {};

  const { error } = await supabase.from("course_notes").upsert(
    {
      course_id: String(courseId || ""),
      body: String(body || ""),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "course_id" }
  );

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ ok: true });
};
