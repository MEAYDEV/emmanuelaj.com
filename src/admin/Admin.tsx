import { useCallback, useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase, supabaseConfigured } from "../lib/supabase";

interface PhotoRow {
  id: string;
  storage_path: string;
  caption: string | null;
  sort: number;
  url?: string;
}

interface BookRow {
  id: string;
  title: string;
  author: string | null;
  status: string | null;
  notes: string | null;
  buy_url: string | null;
  color: string | null;
  sort: number;
}

export default function Admin() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supa = getSupabase();
    if (!supa) {
      setReady(true);
      return;
    }
    supa.then((c) => {
      setClient(c);
      c.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setReady(true);
      });
      c.auth.onAuthStateChange((_e, s) => setSession(s));
    });
  }, []);

  if (!supabaseConfigured) return <SetupInstructions />;
  if (!ready) return <div className="admin-shell"><p className="admin-muted">Loading…</p></div>;
  if (!client) return <SetupInstructions />;
  if (!session) return <SignIn client={client} />;

  return <Dashboard client={client} />;
}

function SetupInstructions() {
  return (
    <div className="admin-shell">
      <div className="admin-card">
        <h1>Admin isn't connected yet</h1>
        <p>
          The photo book and library are managed through Supabase. To switch it on:
        </p>
        <ol>
          <li>Create a free project at <a href="https://supabase.com">supabase.com</a></li>
          <li>
            In the SQL editor, run the setup script from{" "}
            <code>docs/supabase-setup.sql</code> in this repo
          </li>
          <li>
            Add your credentials as environment variables (locally in <code>.env</code>, and in
            Vercel → Project Settings → Environment Variables):
            <pre>{`VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY`}</pre>
          </li>
          <li>
            Create your admin user in Supabase → Authentication → Users → "Add user"
          </li>
          <li>Redeploy, then come back to <code>/admin</code></li>
        </ol>
        <p className="admin-muted">
          Until then, the loft shows the default book list and placeholder photos.
        </p>
        <a className="admin-btn" href="/">Back to the loft</a>
      </div>
    </div>
  );
}

function SignIn({ client }: { client: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  }

  return (
    <div className="admin-shell">
      <form className="admin-card admin-login" onSubmit={submit}>
        <h1>The Loft — Admin</h1>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
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
      </form>
    </div>
  );
}

function Dashboard({ client }: { client: SupabaseClient }) {
  const [tab, setTab] = useState<"photos" | "books">("photos");

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
          <button onClick={() => client.auth.signOut()}>Sign out</button>
        </nav>
      </header>
      {tab === "photos" ? <PhotosTab client={client} /> : <BooksTab client={client} />}
    </div>
  );
}

/* ---------------- photos ---------------- */

function PhotosTab({ client }: { client: SupabaseClient }) {
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await client
      .from("photos")
      .select("id,storage_path,caption,sort")
      .order("sort");
    if (error) {
      setError(error.message);
      return;
    }
    setPhotos(
      (data as PhotoRow[]).map((p) => ({
        ...p,
        url: client.storage.from("photos").getPublicUrl(p.storage_path).data.publicUrl,
      }))
    );
  }, [client]);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error: upErr } = await client.storage.from("photos").upload(path, file);
      if (upErr) {
        setError(upErr.message);
        continue;
      }
      const { error: insErr } = await client.from("photos").insert({
        storage_path: path,
        caption: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        sort: photos.length,
      });
      if (insErr) setError(insErr.message);
    }
    await load();
    setBusy(false);
  }

  async function saveCaption(id: string, caption: string) {
    await client.from("photos").update({ caption }).eq("id", id);
  }

  async function remove(photo: PhotoRow) {
    if (!confirm("Delete this photo?")) return;
    await client.storage.from("photos").remove([photo.storage_path]);
    await client.from("photos").delete().eq("id", photo.id);
    await load();
  }

  return (
    <div className="admin-body">
      <label className="admin-upload">
        {busy ? "Uploading…" : "Upload photos"}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
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
              onBlur={(e) => saveCaption(p.id, e.target.value)}
            />
            <button onClick={() => remove(p)}>Delete</button>
          </figure>
        ))}
      </div>
    </div>
  );
}

/* ---------------- books ---------------- */

const EMPTY_BOOK = {
  title: "",
  author: "",
  status: "read",
  notes: "",
  buy_url: "",
  color: "#5f7d5a",
};

function BooksTab({ client }: { client: SupabaseClient }) {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [draft, setDraft] = useState({ ...EMPTY_BOOK });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await client
      .from("books")
      .select("id,title,author,status,notes,buy_url,color,sort")
      .order("sort");
    if (error) setError(error.message);
    else setBooks(data as BookRow[]);
  }, [client]);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title) return;
    const { error } = await client.from("books").insert({ ...draft, sort: books.length });
    if (error) setError(error.message);
    else {
      setDraft({ ...EMPTY_BOOK });
      await load();
    }
  }

  async function update(id: string, patch: Partial<BookRow>) {
    await client.from("books").update(patch).eq("id", id);
  }

  async function remove(id: string) {
    if (!confirm("Remove this book?")) return;
    await client.from("books").delete().eq("id", id);
    await load();
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
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          required
        />
        <input
          placeholder="Author"
          value={draft.author}
          onChange={(e) => setDraft({ ...draft, author: e.target.value })}
        />
        <select
          value={draft.status}
          onChange={(e) => setDraft({ ...draft, status: e.target.value })}
        >
          <option value="read">Read</option>
          <option value="reading">Reading</option>
        </select>
        <input
          placeholder="Buy link"
          value={draft.buy_url}
          onChange={(e) => setDraft({ ...draft, buy_url: e.target.value })}
        />
        <input
          type="color"
          value={draft.color}
          onChange={(e) => setDraft({ ...draft, color: e.target.value })}
          title="Cover color"
        />
        <input
          placeholder="Notes (shown when the book is pulled out)"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
        />
        <button className="admin-btn">Add book</button>
      </form>
      <div className="admin-books">
        {books.map((b) => (
          <div key={b.id} className="admin-book-row">
            <span className="admin-book-swatch" style={{ background: b.color ?? "#5f7d5a" }} />
            <input defaultValue={b.title} onBlur={(e) => update(b.id, { title: e.target.value })} />
            <input
              defaultValue={b.author ?? ""}
              placeholder="Author"
              onBlur={(e) => update(b.id, { author: e.target.value })}
            />
            <select
              defaultValue={b.status ?? "read"}
              onChange={(e) => update(b.id, { status: e.target.value })}
            >
              <option value="read">Read</option>
              <option value="reading">Reading</option>
            </select>
            <input
              defaultValue={b.notes ?? ""}
              placeholder="Notes"
              onBlur={(e) => update(b.id, { notes: e.target.value })}
            />
            <input
              defaultValue={b.buy_url ?? ""}
              placeholder="Buy link"
              onBlur={(e) => update(b.id, { buy_url: e.target.value })}
            />
            <button onClick={() => remove(b.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
