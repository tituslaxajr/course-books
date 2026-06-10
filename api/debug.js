const supabase = require("../lib/supabase");

module.exports = async (req, res) => {
  const url = process.env.SUPABASE_URL || "(not set)";
  const keySet = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase.from("progress").select("count").limit(1);

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  const { data: files, error: filesError } = await supabase.storage.from("library").list("", { limit: 20 });

  res.status(200).json({
    supabaseUrl: url,
    serviceRoleKeySet: keySet,
    dbPing: error ? { ok: false, error: error.message, code: error.code } : { ok: true },
    buckets: bucketsError ? { error: bucketsError.message } : (buckets || []).map((b) => b.name),
    libraryBucketFiles: filesError ? { error: filesError.message } : files,
  });
};
