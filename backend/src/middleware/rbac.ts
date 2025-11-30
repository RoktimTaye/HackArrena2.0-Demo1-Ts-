import { Request, Response, NextFunction } from "express";

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.user?.permissions || [];
    if (!permissions.includes(permission) && !permissions.includes("*")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
