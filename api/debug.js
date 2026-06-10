const supabase = require("../lib/supabase");

function jwtRole(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    return payload.role || "unknown";
  } catch {
    return "invalid-jwt";
  }
}

module.exports = async (req, res) => {
  const url = process.env.SUPABASE_URL || "(not set)";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const { data: dbData, error: dbError } = await supabase.from("progress").select("count").limit(1);
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  const { data: filesRoot, error: filesRootError } = await supabase.storage.from("library").list(undefined, { limit: 20 });
  const { data: filesEmpty, error: filesEmptyError } = await supabase.storage.from("library").list("", { limit: 20 });

  const knownFile = "daily_doctrine_1.pdf";
  const { data: publicUrlData } = supabase.storage.from("library").getPublicUrl(knownFile);

  res.status(200).json({
    supabaseUrl: url,
    keyRole: jwtRole(key),
    dbPing: dbError ? { ok: false, error: dbError.message } : { ok: true },
    buckets: bucketsError ? { error: bucketsError.message } : (buckets || []).map((b) => b.name),
    listWithUndefined: filesRootError ? { error: filesRootError.message } : filesRoot,
    listWithEmpty: filesEmptyError ? { error: filesEmptyError.message } : filesEmpty,
    publicUrlForKnownFile: publicUrlData?.publicUrl || null,
  });
};
