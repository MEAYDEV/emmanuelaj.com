#!/usr/bin/env node
/**
 * Generates random admin credentials for server-side env vars.
 * Output is written to .admin-secrets.local (gitignored) — never commit this file.
 */
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

function token(bytes = 24) {
  return randomBytes(bytes).toString("base64url");
}

const username = `loft-${token(6)}`;
const password = token(32);
const sessionSecret = token(32);

const lines = [
  "# Server-only — add these in Vercel → Project Settings → Environment Variables",
  "# NEVER commit this file or paste into frontend code.",
  "",
  `ADMIN_USERNAME=${username}`,
  `ADMIN_PASSWORD=${password}`,
  `ADMIN_SESSION_SECRET=${sessionSecret}`,
  "",
  "# Also required for CMS writes (service role — server only):",
  "# SUPABASE_URL=https://YOUR-PROJECT.supabase.co",
  "# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key",
  "",
  "# Public (safe for browser — anon key only):",
  "# VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co",
  "# VITE_SUPABASE_ANON_KEY=your-anon-key",
  "",
];

const out = lines.join("\n");
writeFileSync(".admin-secrets.local", out, { mode: 0o600 });
console.log("Wrote .admin-secrets.local (gitignored)\n");
console.log(out);
