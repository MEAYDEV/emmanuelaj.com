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
  if (!id) return res.status(400).json({ error: "Missing book id." });

  if (req.method === "PATCH") {
    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    for (const key of ["title", "author", "status", "notes", "buy_url", "color"] as const) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    const { error } = await supa.from("books").update(patch).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { error } = await supa.from("books").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
