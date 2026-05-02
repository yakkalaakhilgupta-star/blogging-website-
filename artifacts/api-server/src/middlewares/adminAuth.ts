import { type Request, type Response, type NextFunction } from "express";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!ADMIN_SECRET) {
    res.status(503).json({ error: "Admin access not configured. Set ADMIN_SECRET environment variable." });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || token !== ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
