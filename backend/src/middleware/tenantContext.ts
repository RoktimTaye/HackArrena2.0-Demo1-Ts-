import { Request, Response, NextFunction } from "express";

export const tenantContext = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.tenantId) {
    req.tenantId = req.user.tenantId;
  }
  next();
};
