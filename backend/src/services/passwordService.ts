import { getTenantConnection } from "../config/db";
import { getUserModel } from "../models/User";
import { getPasswordHistoryModel } from "../models/PasswordHistory";
import { getPasswordResetTokenModel } from "../models/PasswordResetToken";
import { validatePasswordPolicy } from "../utils/passwordPolicy";
import { hashPassword, comparePassword } from "../utils/crypto";
import { mailer } from "../config/mailer";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";

export const setUserPassword = async (
  tenantId: string,
  userId: string,
  newPassword: string,
  skipOldCheck = false
) => {
  const policyError = validatePasswordPolicy(newPassword);
  if (policyError) throw { status: 400, message: policyError };

  const conn = getTenantConnection(tenantId);
  const User = getUserModel(conn);
  const PasswordHistory = getPasswordHistoryModel(conn);

  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  const history = await PasswordHistory.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(3);

  if (!skipOldCheck) {
    for (const h of history) {
      const same = await comparePassword(newPassword, h.passwordHash);
      if (same) {
        throw {
          status: 400,
          message: "New password cannot be same as last 3 passwords"
        };
      }
    }
  }

  const passwordHash = await hashPassword(newPassword);
  user.passwordHash = passwordHash;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  user.forcePasswordChange = false;
  user.status = "ACTIVE";
  await user.save();

  await PasswordHistory.create({
    userId: user.id,
    passwordHash
  });

  const count = await PasswordHistory.countDocuments({ userId: user.id });
  if (count > 3) {
    const extra = await PasswordHistory.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .skip(3);
    const ids = extra.map((d) => d.id);
    if (ids.length) {
      await PasswordHistory.deleteMany({ _id: { $in: ids } });
    }
  }
};

export const requestPasswordReset = async (tenantId: string, email: string) => {
  const conn = getTenantConnection(tenantId);
  const User = getUserModel(conn);
  const PasswordResetToken = getPasswordResetTokenModel(conn);

  const user = await User.findOne({ email });
  if (!user) return;

  const token = uuid();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await PasswordResetToken.create({
    userId: user.id,
    token,
    expiresAt,
    used: false
  });

  const link = `${env.frontendBaseUrl}/reset-password?tenantId=${tenantId}&token=${token}`;

  await mailer.sendMail({
    to: email,
    subject: "Password Reset",
    text: `Click the link to reset your password (valid for 1 hour):
${link}`
  });
};

export const resetPasswordWithToken = async (
  tenantId: string,
  token: string,
  newPassword: string
) => {
  const conn = getTenantConnection(tenantId);
  const PasswordResetToken = getPasswordResetTokenModel(conn);

  const record = await PasswordResetToken.findOne({ token });
  if (!record || record.used || record.expiresAt < new Date()) {
    throw { status: 400, message: "Invalid or expired token" };
  }

  await setUserPassword(tenantId, record.userId, newPassword);
  record.used = true;
  await record.save();
};

export const changePassword = async (
  tenantId: string,
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const conn = getTenantConnection(tenantId);
  const User = getUserModel(conn);
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  const ok = await comparePassword(oldPassword, user.passwordHash);
  if (!ok) throw { status: 400, message: "Old password incorrect" };

  await setUserPassword(tenantId, userId, newPassword);
};
