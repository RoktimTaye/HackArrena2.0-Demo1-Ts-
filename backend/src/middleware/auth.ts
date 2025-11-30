import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { getTenantConnection } from "../config/db";
import { getUserModel } from "../models/User";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "Missing Authorization header" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid Authorization header" });

  try {
    const payload = jwt.verify(token, env.jwtSecret) as any;

    const tenantId = payload.tenantId;
    const conn = getTenantConnection(tenantId);
    const User = getUserModel(conn);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Session expired" });
    }

    req.user = {
      id: user.id,
      tenantId,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      attributes: payload.attributes || {},
      mustChangePassword: user.forcePasswordChange || user.status === "PASSWORD_EXPIRED",
      tokenVersion: user.tokenVersion
    };
    req.tenantId = tenantId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
