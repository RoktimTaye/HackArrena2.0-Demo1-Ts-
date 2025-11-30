import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";
import { getTenantConnection } from "../config/db";
import { getUserModel } from "../models/User";
import { hashPassword } from "../utils/crypto";
import { validatePasswordPolicy } from "../utils/passwordPolicy";
import { mailer } from "../config/mailer";

const router = Router();

router.get(
  "/",
  authenticate,
  requirePermission("USER:READ"),
  async (req, res) => {
    const conn = getTenantConnection(req.tenantId!);
    const User = getUserModel(conn);
    const users = await User.find();
    res.json(users);
  }
);

router.post(
  "/",
  authenticate,
  requirePermission("USER:CREATE"),
  async (req, res) => {
    const tenantId = req.tenantId!;
    const conn = getTenantConnection(tenantId);
    const User = getUserModel(conn);

    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      roles
    } = req.body;

    const hospitalDomain = email.split("@")[1] || "hospital.local";
    const username = `${firstName}.${lastName}@${hospitalDomain}`.toLowerCase();

    const tempPassword = "Temp@1234";
    const policyError = validatePasswordPolicy(tempPassword);
    if (policyError) {
      return res.status(400).json({ message: policyError });
    }
    const passwordHash = await hashPassword(tempPassword);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      department,
      roles,
      username,
      passwordHash,
      status: "ACTIVE",
      tokenVersion: 0,
      forcePasswordChange: true,
      attributes: { department }
    });

    await mailer.sendMail({
      to: email,
      subject: "Welcome to HMS",
      text: `Your account has been created.
Username: ${username}
Temporary password: ${tempPassword}`
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  }
);

router.patch(
  "/:id/status",
  authenticate,
  requirePermission("USER:UPDATE"),
  async (req, res) => {
    const conn = getTenantConnection(req.tenantId!);
    const User = getUserModel(conn);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  }
);

router.post(
  "/:id/force-password-change",
  authenticate,
  requirePermission("USER:UPDATE"),
  async (req, res) => {
    const conn = getTenantConnection(req.tenantId!);
    const User = getUserModel(conn);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { forcePasswordChange: true, status: "PASSWORD_EXPIRED" },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User will be forced to change password on next login" });
  }
);

export default router;
