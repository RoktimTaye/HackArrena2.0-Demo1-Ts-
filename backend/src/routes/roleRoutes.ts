import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";
import { getTenantConnection } from "../config/db";
import { getRoleModel } from "../models/Role";

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission("ROLE:READ"),
  async (req, res) => {
    const tenantId = req.tenantId!;
    const conn = getTenantConnection(tenantId);
    const Role = getRoleModel(conn);
    const roles = await Role.find();
    res.json(roles);
  }
);

router.post(
  "/",
  authenticate,
  requirePermission("ROLE:CREATE"),
  async (req, res) => {
    const conn = getTenantConnection(req.tenantId!);
    const Role = getRoleModel(conn);
    const role = await Role.create(req.body);
    res.status(201).json(role);
  }
);

router.patch(
  "/:name",
  authenticate,
  requirePermission("ROLE:UPDATE"),
  async (req, res) => {
    const conn = getTenantConnection(req.tenantId!);
    const Role = getRoleModel(conn);
    const role = await Role.findOneAndUpdate(
      { name: req.params.name },
      req.body,
      { new: true }
    );
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  }
);

export default router;
