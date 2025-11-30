import { Router } from "express";
import { loginWithPassword } from "../services/authService";
import { requestPasswordReset, resetPasswordWithToken, changePassword } from "../services/passwordService";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login", async (req, res) => {
  const { tenantId, username, password } = req.body;
  const result = await loginWithPassword(tenantId, username, password);
  res.json(result);
});

router.post("/forgot-password", async (req, res) => {
  const { tenantId, email } = req.body;
  await requestPasswordReset(tenantId, email);
  res.json({ message: "If account exists, reset mail sent" });
});

router.post("/reset-password", async (req, res) => {
  const { tenantId, token, newPassword } = req.body;
  await resetPasswordWithToken(tenantId, token, newPassword);
  res.json({ message: "Password reset successful" });
});

router.post("/change-password", authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await changePassword(req.tenantId!, req.user!.id, oldPassword, newPassword);
  res.json({ message: "Password changed" });
});

export default router;
