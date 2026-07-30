import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_BOOKS, type Book, type Photo } from "../data/library";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> | null {
  if (!supabaseConfigured) return null;
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(url!, anonKey!)
    );
  }
  return clientPromise;
}

interface BookRow {
  id: string;
  title: string;
  author: string | null;
  status: string | null;
  notes: string | null;
  buy_url: string | null;
  color: string | null;
  cover_url: string | null;
}

export async function fetchBooks(): Promise<Book[]> {
  const supa = getSupabase();
  if (!supa) return DEFAULT_BOOKS;
  try {
    const client = await supa;
    const { data, error } = await client
      .from("books")
      .select("id,title,author,status,notes,buy_url,color,cover_url")
      .order("sort", { ascending: true });
    if (error || !data || data.length === 0) return DEFAULT_BOOKS;
    return (data as BookRow[]).map((r, i) => ({
      id: r.id,
      title: r.title,
      author: r.author ?? "",
      status: r.status === "reading" ? "reading" : "read",
      notes: r.notes ?? "",
      buyUrl: r.buy_url ?? "",
      color: r.color ?? DEFAULT_BOOKS[i % DEFAULT_BOOKS.length].color,
      coverUrl: r.cover_url ?? undefined,
    }));
  } catch {
    return DEFAULT_BOOKS;
  }
}

interface PhotoRow {
  id: string;
  storage_path: string;
  caption: string | null;
}

export async function fetchPhotos(): Promise<Photo[]> {
  const supa = getSupabase();
  if (!supa) return [];
  try {
    const client = await supa;
    const { data, error } = await client
      .from("photos")
      .select("id,storage_path,caption")
      .order("sort", { ascending: true });
    if (error || !data) return [];
    return (data as PhotoRow[]).map((r) => ({
      id: r.id,
      url: client.storage.from("photos").getPublicUrl(r.storage_path).data.publicUrl,
      caption: r.caption ?? "",
    }));
  } catch {
    return [];
  }
}
