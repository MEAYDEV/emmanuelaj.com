import { useCallback, useEffect, useState } from "react";
import {
  createBook,
  deleteBook,
  deletePhoto,
  fetchBooks,
  fetchPhotos,
  fetchSession,
  login,
  logout,
  updateBook,
  updatePhotoCaption,
  uploadPhoto,
  type BookRow,
  type PhotoRow,
  type SessionInfo,
} from "../lib/admin-api";

export default function Admin() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const s = await fetchSession();
      setSession(s);
    } catch {
      setSession({ authenticated: false, cmsReady: false, configured: false });
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!ready) {
    return (
      <div className="admin-shell">
        <p className="admin-muted">Loading…</p>
      </div>
    );
  }

  if (!session?.configured) return <SetupInstructions />;
  if (!session.authenticated) return <SignIn onSuccess={refresh} />;

  return <Dashboard cmsReady={session.cmsReady} onSignOut={refresh} />;
}

function SetupInstructions() {
  return (
    <div className="admin-shell">
      <div className="admin-card">
        <h1>Admin isn't configured yet</h1>
        <p>
          Admin credentials live only in server environment variables — they are never shipped to
          the browser. Set these in Vercel → Project Settings → Environment Variables:
        </p>
        <ul>
          <li><code>ADMIN_USERNAME</code></li>
          <li><code>ADMIN_PASSWORD</code></li>
          <li><code>ADMIN_SESSION_SECRET</code></li>
          <li><code>SUPABASE_URL</code> + <code>SUPABASE_SERVICE_ROLE_KEY</code></li>
          <li><code>VITE_SUPABASE_URL</code> + <code>VITE_SUPABASE_ANON_KEY</code> (public reads)</li>
        </ul>
        <p>
          Run <code>node scripts/generate-admin-secrets.mjs</code> locally to generate random
          values. Then run <code>docs/supabase-setup.sql</code> in your Supabase SQL editor.
        </p>
        <p className="admin-muted">
          Until CMS is connected, the loft uses built-in defaults and placeholder photos.
        </p>
        <a className="admin-btn" href="/">
          Back to the loft
        </a>
      </div>
    </div>
  );
}

function SignIn({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(username.trim(), password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-shell">
      <form className="admin-card admin-login" onSubmit={submit}>
        <h1>The Loft — Admin</h1>
        <p className="admin-muted">Credentials are verified server-side only.</p>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button className="admin-btn" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <a className="admin-muted" href="/" style={{ marginTop: 12, display: "inline-block" }}>
          ← Back to the loft
        </a>
      </form>
    </div>
  );
}

function Dashboard({ cmsReady, onSignOut }: { cmsReady: boolean; onSignOut: () => void }) {
  const [tab, setTab] = useState<"photos" | "books">("photos");

  async function signOut() {
    await logout();
    onSignOut();
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>The Loft — Admin</h1>
        <nav>
          <button
            className={tab === "photos" ? "is-active" : ""}
            onClick={() => setTab("photos")}
          >
            Photo book
          </button>
          <button
            className={tab === "books" ? "is-active" : ""}
            onClick={() => setTab("books")}
          >
            Library
          </button>
          <a href="/">View loft</a>
          <button onClick={signOut}>Sign out</button>
        </nav>
      </header>
      {!cmsReady && (
        <p className="admin-error admin-body">
          Signed in, but CMS storage is not configured. Add{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> on the server.
        </p>
      )}
      {tab === "photos" ? <PhotosTab disabled={!cmsReady} /> : <BooksTab disabled={!cmsReady} />}
    </div>
  );
}

function PhotosTab({ disabled }: { disabled: boolean }) {
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (disabled) return;
    try {
      setPhotos(await fetchPhotos());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos.");
    }
  }, [disabled]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(files: FileList | null) {
    if (!files?.length || disabled) return;
    setBusy(true);
    setError("");
    for (const file of Array.from(files)) {
      try {
        await uploadPhoto(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    }
    await load();
    setBusy(false);
  }

  async function saveCaption(id: string, caption: string) {
    try {
      await updatePhotoCaption(id, caption);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    }
  }

  async function remove(photo: PhotoRow) {
    if (!confirm("Delete this photo?")) return;
    try {
      await deletePhoto(photo.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  return (
    <div className="admin-body">
      <label className="admin-upload">
        {busy ? "Uploading…" : "Upload photos"}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={busy || disabled}
          onChange={(e) => upload(e.target.files)}
        />
      </label>
      {error && <p className="admin-error">{error}</p>}
      {photos.length === 0 && (
        <p className="admin-muted">No photos yet — the loft shows placeholders until you upload.</p>
      )}
      <div className="admin-grid">
        {photos.map((p) => (
          <figure key={p.id} className="admin-photo">
            <img src={p.url} alt={p.caption ?? ""} />
            <input
              defaultValue={p.caption ?? ""}
              placeholder="Caption"
              disabled={disabled}
              onBlur={(e) => saveCaption(p.id, e.target.value)}
            />
            <button disabled={disabled} onClick={() => remove(p)}>
              Delete
            </button>
          </figure>
        ))}
      </div>
    </div>
  );
}

const EMPTY_BOOK = {
  title: "",
  author: "",
  status: "read",
  notes: "",
  buy_url: "",
  color: "#5f7d5a",
};

function BooksTab({ disabled }: { disabled: boolean }) {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [draft, setDraft] = useState({ ...EMPTY_BOOK });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (disabled) return;
    try {
      setBooks(await fetchBooks());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load books.");
    }
  }, [disabled]);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title || disabled) return;
    try {
      await createBook(draft);
      setDraft({ ...EMPTY_BOOK });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add failed.");
    }
  }

  async function update(id: string, patch: Partial<BookRow>) {
    try {
      await updateBook(id, patch);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this book?")) return;
    try {
      await deleteBook(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  return (
    <div className="admin-body">
      {error && <p className="admin-error">{error}</p>}
      {books.length === 0 && (
        <p className="admin-muted">
          No books yet — the loft shows the built-in defaults until you add your own.
        </p>
      )}
      <form className="admin-book-form" onSubmit={add}>
        <input
          placeholder="Title"
          value={draft.title}
          disabled={disabled}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          required
        />
        <input
          placeholder="Author"
          value={draft.author}
          disabled={disabled}
          onChange={(e) => setDraft({ ...draft, author: e.target.value })}
        />
        <select
          value={draft.status}
          disabled={disabled}
          onChange={(e) => setDraft({ ...draft, status: e.target.value })}
        >
          <option value="read">Read</option>
          <option value="reading">Reading</option>
        </select>
        <input
          placeholder="Buy link"
          value={draft.buy_url}
          disabled={disabled}
          onChange={(e) => setDraft({ ...draft, buy_url: e.target.value })}
        />
        <input
          type="color"
          value={draft.color}
          disabled={disabled}
          onChange={(e) => setDraft({ ...draft, color: e.target.value })}
          title="Cover color"
        />
        <input
          placeholder="Notes (shown when the book is pulled out)"
          value={draft.notes}
          disabled={disabled}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        />
        <button className="admin-btn" disabled={disabled}>
          Add book
        </button>
      </form>
      <div className="admin-books">
        {books.map((b) => (
          <div key={b.id} className="admin-book-row">
            <span className="admin-book-swatch" style={{ background: b.color ?? "#5f7d5a" }} />
            <input
              defaultValue={b.title}
              disabled={disabled}
              onBlur={(e) => update(b.id, { title: e.target.value })}
            />
            <input
              defaultValue={b.author ?? ""}
              placeholder="Author"
              disabled={disabled}
              onBlur={(e) => update(b.id, { author: e.target.value })}
            />
            <select
              defaultValue={b.status ?? "read"}
              disabled={disabled}
              onChange={(e) => update(b.id, { status: e.target.value })}
            >
              <option value="read">Read</option>
              <option value="reading">Reading</option>
            </select>
            <input
              defaultValue={b.notes ?? ""}
              placeholder="Notes"
              disabled={disabled}
              onBlur={(e) => update(b.id, { notes: e.target.value })}
            />
            <input
              defaultValue={b.buy_url ?? ""}
              placeholder="Buy link"
              disabled={disabled}
              onBlur={(e) => update(b.id, { buy_url: e.target.value })}
            />
            <button disabled={disabled} onClick={() => remove(b.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
