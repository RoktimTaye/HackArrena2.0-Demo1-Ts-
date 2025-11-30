import { Router } from "express";
import { createAuthCode, exchangeAuthCode, loginWithPassword, refreshWithToken } from "../services/authService";

const router = Router();

// Authorization Code: simplified username/password based authorize endpoint
router.post("/authorize", async (req, res) => {
  const { tenantId, username, password, clientId } = req.body;
  const code = await createAuthCode(tenantId, username, password, clientId);
  res.json({ code });
});

// Token endpoint: supports password, refresh_token, authorization_code
router.post("/token", async (req, res) => {
  const { grant_type } = req.body;

  if (grant_type === "password") {
    const { tenantId, username, password } = req.body;
    const { accessToken, refreshToken, mustChangePassword } =
      await loginWithPassword(tenantId, username, password);
    return res.json({
      token_type: "bearer",
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      must_change_password: mustChangePassword
    });
  }

  if (grant_type === "refresh_token") {
    const { refresh_token } = req.body;
    const { accessToken, refreshToken } = await refreshWithToken(refresh_token);
    return res.json({
      token_type: "bearer",
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600
    });
  }

  if (grant_type === "authorization_code") {
    const { tenantId, code } = req.body;
    const { accessToken, refreshToken } = await exchangeAuthCode(tenantId, code);
    return res.json({
      token_type: "bearer",
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600
    });
  }

  return res.status(400).json({ error: "unsupported_grant_type" });
});

export default router;
