const supabase = require("../lib/supabase");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { courseId, sessionNumber, score, totalQuestions, answers } = req.body || {};

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      course_id: String(courseId || ""),
      session_number: Number(sessionNumber),
      score: Number(score || 0),
      total_questions: Number(totalQuestions || 0),
      answers_json: answers || [],
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const row = { ...data, answers: Array.isArray(data.answers_json) ? data.answers_json : [], answers_json: undefined };
  res.status(200).json({ ok: true, data: row });
};
