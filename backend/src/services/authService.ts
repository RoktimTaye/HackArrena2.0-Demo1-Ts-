import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { getTenantConnection } from "../config/db";
import { getUserModel } from "../models/User";
import { comparePassword } from "../utils/crypto";
import { getEffectivePermissions } from "./roleService";
import { Tenant } from "../models/Tenant";
import { redisClient, tenantKey } from "../config/redis";
import { v4 as uuid } from "uuid";

const buildTokens = async (tenantId: string, user: any) => {
  const roles = user.roles || [];
  const permissions = await getEffectivePermissions(tenantId, roles);

  const payload = {
    userId: user.id,
    tenantId,
    roles,
    permissions,
    attributes: user.attributes || {},
    tokenVersion: user.tokenVersion || 0
  };

  const accessToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

  const refreshToken = jwt.sign(
    { userId: user.id, tenantId, tokenVersion: user.tokenVersion || 0 },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

export const loginWithPassword = async (
  tenantId: string,
  username: string,
  password: string
) => {
  const tenant = await Tenant.findOne({ tenantId });
  if (!tenant || (tenant.status !== "ACTIVE" && tenant.status !== "VERIFIED")) {
    throw { status: 403, message: "Tenant not active" };
  }

  const conn = getTenantConnection(tenantId);
  const User = getUserModel(conn);

  const user = await User.findOne({ username });
  if (!user) throw { status: 401, message: "Invalid credentials" };
  if (user.status === "LOCKED" || user.status === "INACTIVE") {
    throw { status: 403, message: "Account is locked or inactive" };
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw { status: 401, message: "Invalid credentials" };

  const tokens = await buildTokens(tenantId, user);
  const mustChangePassword = user.forcePasswordChange || user.status === "PASSWORD_EXPIRED";

  return { ...tokens, mustChangePassword };
};

export const refreshWithToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as any;
    const tenantId = decoded.tenantId;
    const conn = getTenantConnection(tenantId);
    const User = getUserModel(conn);
    const user = await User.findById(decoded.userId);
    if (!user) throw { status: 401, message: "User not found" };
    if (user.tokenVersion !== decoded.tokenVersion) {
      throw { status: 401, message: "Refresh token expired" };
    }
    return buildTokens(tenantId, user);
  } catch {
    throw { status: 401, message: "Invalid refresh token" };
  }
};

export const createAuthCode = async (
  tenantId: string,
  username: string,
  password: string,
  clientId: string
) => {
  const { accessToken, refreshToken } = await loginWithPassword(
    tenantId,
    username,
    password
  );
  const code = uuid();
  const key = tenantKey(tenantId, `oauth:code:${code}`);
  await redisClient.set(
    key,
    JSON.stringify({ clientId, accessToken, refreshToken }),
    { EX: 300 }
  );
  return code;
};

export const exchangeAuthCode = async (tenantId: string, code: string) => {
  const key = tenantKey(tenantId, `oauth:code:${code}`);
  const stored = await redisClient.get(key);
  if (!stored) throw { status: 400, message: "Invalid authorization code" };
  await redisClient.del(key);
  const parsed = JSON.parse(stored);
  return {
    accessToken: parsed.accessToken,
    refreshToken: parsed.refreshToken
  };
};
