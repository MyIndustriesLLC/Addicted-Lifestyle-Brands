import { Request, Response, NextFunction } from "express";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    isAdminAuthenticated?: boolean;
  }
}

export const isAdminSubdomain = (req: Request): boolean => {
  const host = req.get('host') || '';
  return host.startsWith('admin.');
};

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isAdminAuthenticated) {
    return res.status(401).json({ error: "Unauthorized - Admin authentication required" });
  }
  next();
};

export const verifyAdminPassword = (password: string): boolean => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  return adminPassword === password;
};
