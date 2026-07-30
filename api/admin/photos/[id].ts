import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../_lib/auth";
import { getAdminSupabase } from "../../_lib/supabase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const supa = getAdminSupabase();
  if (!supa) {
    return res.status(503).json({ error: "CMS storage is not configured (missing service role key)." });
  }

  const id = req.query.id as string | undefined;
  if (!id) return res.status(400).json({ error: "Missing photo id." });

  if (req.method === "PATCH") {
    const body = req.body as { caption?: string };
    const { error } = await supa.from("photos").update({ caption: body.caption ?? null }).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { data: row, error: fetchErr } = await supa
      .from("photos")
      .select("storage_path")
      .eq("id", id)
      .single();
    if (fetchErr) return res.status(404).json({ error: fetchErr.message });

    await supa.storage.from("photos").remove([row.storage_path]);
    const { error } = await supa.from("photos").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
