import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../_lib/auth";
import { getAdminSupabase } from "../_lib/supabase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const supa = getAdminSupabase();
  if (!supa) {
    return res.status(503).json({ error: "CMS storage is not configured (missing service role key)." });
  }

  if (req.method === "GET") {
    const { data, error } = await supa
      .from("photos")
      .select("id,storage_path,caption,sort")
      .order("sort");
    if (error) return res.status(500).json({ error: error.message });
    const photos = (data ?? []).map((p) => ({
      ...p,
      url: supa.storage.from("photos").getPublicUrl(p.storage_path).data.publicUrl,
    }));
    return res.status(200).json({ photos });
  }

  if (req.method === "POST") {
    const body = req.body as {
      fileName?: string;
      contentType?: string;
      dataBase64?: string;
      caption?: string;
    };
    const fileName = body.fileName?.replace(/[^a-zA-Z0-9.-]/g, "_") ?? "upload.jpg";
    const dataBase64 = body.dataBase64;
    if (!dataBase64) return res.status(400).json({ error: "Missing file data." });

    const buffer = Buffer.from(dataBase64, "base64");
    if (buffer.byteLength > 8 * 1024 * 1024) {
      return res.status(413).json({ error: "File too large (max 8 MB)." });
    }

    const path = `${Date.now()}-${fileName}`;
    const { error: upErr } = await supa.storage
      .from("photos")
      .upload(path, buffer, { contentType: body.contentType ?? "image/jpeg", upsert: false });
    if (upErr) return res.status(500).json({ error: upErr.message });

    const { count } = await supa.from("photos").select("*", { count: "exact", head: true });
    const { data, error: insErr } = await supa
      .from("photos")
      .insert({
        storage_path: path,
        caption: body.caption ?? fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        sort: count ?? 0,
      })
      .select("id,storage_path,caption,sort")
      .single();
    if (insErr) return res.status(500).json({ error: insErr.message });

    return res.status(201).json({
      photo: {
        ...data,
        url: supa.storage.from("photos").getPublicUrl(data.storage_path).data.publicUrl,
      },
    });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
