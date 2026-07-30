import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthenticated } from "../../server/_lib/auth";
import { getAdminSupabase } from "../../server/_lib/supabase-admin";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const configured =
    !!process.env.ADMIN_SESSION_SECRET &&
    !!process.env.ADMIN_USERNAME &&
    !!process.env.ADMIN_PASSWORD;

  return res.status(200).json({
    authenticated: configured && isAuthenticated(req),
    cmsReady: !!getAdminSupabase(),
    configured,
  });
}
