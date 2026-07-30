import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../server/_lib/auth";
import { getAdminSupabase } from "../../server/_lib/supabase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  const supa = getAdminSupabase();
  if (!supa) {
    return res.status(503).json({ error: "CMS storage is not configured (missing service role key)." });
  }

  if (req.method === "GET") {
    const { data, error } = await supa
      .from("books")
      .select("id,title,author,status,notes,buy_url,color,sort")
      .order("sort");
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ books: data ?? [] });
  }

  if (req.method === "POST") {
    const body = req.body as Record<string, unknown>;
    if (!body.title || typeof body.title !== "string") {
      return res.status(400).json({ error: "Title is required." });
    }
    const { count } = await supa.from("books").select("*", { count: "exact", head: true });
    const { data, error } = await supa
      .from("books")
      .insert({
        title: body.title,
        author: (body.author as string) ?? null,
        status: (body.status as string) ?? "read",
        notes: (body.notes as string) ?? null,
        buy_url: (body.buy_url as string) ?? null,
        color: (body.color as string) ?? "#5f7d5a",
        sort: count ?? 0,
      })
      .select("id,title,author,status,notes,buy_url,color,sort")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ book: data });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
