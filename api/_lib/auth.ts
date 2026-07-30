import { createHmac, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const COOKIE = "loft_admin_session";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function signSession(secret: string): string {
  const payload = JSON.stringify({ exp: Date.now() + TTL_MS, v: 1 });
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifySession(token: string, secret: string): boolean {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return false;
  }
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    if (!safeEqual(sig, expected)) return false;
  } catch {
    return false;
  }
  try {
    const { exp } = JSON.parse(payload) as { exp: number };
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export function sessionCookie(token: string): string {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.floor(TTL_MS / 1000)}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function parseSessionCookie(header: string | undefined): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`${COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function isAuthenticated(req: VercelRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const token = parseSessionCookie(req.headers.cookie);
  return !!token && verifySession(token, secret);
}

export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (!process.env.ADMIN_SESSION_SECRET || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin auth is not configured on the server." });
    return false;
  }
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!expectedUser || !expectedPass || !secret) return false;
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
}
