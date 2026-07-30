import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkCredentials, sessionCookie, signSession } from "../_lib/auth";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ error: "Admin auth is not configured on the server." });
  }

  const body = req.body as { username?: string; password?: string } | undefined;
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  if (!checkCredentials(username, password)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = signSession(secret);
  res.setHeader("Set-Cookie", sessionCookie(token));
  return res.status(200).json({ ok: true });
}
