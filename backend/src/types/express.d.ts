import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      tenantId: string;
      roles: string[];
      permissions: string[];
      attributes?: {
        department?: string;
        specialization?: string;
        shift?: string;
      };
      mustChangePassword?: boolean;
      tokenVersion?: number;
    };
    tenantId?: string;
  }
}
