/** Admin API client — credentials stay server-side; only HttpOnly session cookie is used. */

const jsonHeaders = { "Content-Type": "application/json" };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: "same-origin", ...init });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return body as T;
}

export interface SessionInfo {
  authenticated: boolean;
  cmsReady: boolean;
  configured: boolean;
}

export function fetchSession(): Promise<SessionInfo> {
  return api<SessionInfo>("/api/admin/session");
}

export function login(username: string, password: string): Promise<void> {
  return api("/api/admin/login", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ username, password }),
  });
}

export function logout(): Promise<void> {
  return api("/api/admin/logout", { method: "POST" });
}

export interface PhotoRow {
  id: string;
  storage_path: string;
  caption: string | null;
  sort: number;
  url?: string;
}

export interface BookRow {
  id: string;
  title: string;
  author: string | null;
  status: string | null;
  notes: string | null;
  buy_url: string | null;
  color: string | null;
  sort: number;
}

export function fetchPhotos(): Promise<PhotoRow[]> {
  return api<{ photos: PhotoRow[] }>("/api/admin/photos").then((r) => r.photos);
}

export async function uploadPhoto(file: File): Promise<PhotoRow> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  const dataBase64 = btoa(binary);
  const res = await api<{ photo: PhotoRow }>("/api/admin/photos", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || "image/jpeg",
      dataBase64,
    }),
  });
  return res.photo;
}

export function updatePhotoCaption(id: string, caption: string): Promise<void> {
  return api(`/api/admin/photos/${id}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ caption }),
  });
}

export function deletePhoto(id: string): Promise<void> {
  return api(`/api/admin/photos/${id}`, { method: "DELETE" });
}

export function fetchBooks(): Promise<BookRow[]> {
  return api<{ books: BookRow[] }>("/api/admin/books").then((r) => r.books);
}

export function createBook(book: Omit<BookRow, "id" | "sort">): Promise<BookRow> {
  return api<{ book: BookRow }>("/api/admin/books", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(book),
  }).then((r) => r.book);
}

export function updateBook(id: string, patch: Partial<BookRow>): Promise<void> {
  return api(`/api/admin/books/${id}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify(patch),
  });
}

export function deleteBook(id: string): Promise<void> {
  return api(`/api/admin/books/${id}`, { method: "DELETE" });
}
