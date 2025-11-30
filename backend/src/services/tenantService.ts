import { v4 as uuid } from "uuid";
import { Tenant } from "../models/Tenant";
import { TenantVerificationToken } from "../models/TenantVerificationToken";
import { mailer } from "../config/mailer";
import { env } from "../config/env";
import { seedRolesForTenant } from "./roleService";
import { getTenantConnection } from "../config/db";
import { getUserModel } from "../models/User";
import { hashPassword } from "../utils/crypto";

export const registerHospital = async (payload: {
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  licenseNumber: string;
  adminUsername?: string;
  adminPassword?: string;
}) => {
  const existing = await Tenant.findOne({ licenseNumber: payload.licenseNumber });
  if (existing) {
    throw { status: 400, message: "License number already exists" };
  }

  const tenantId = uuid();

  const tenant = await Tenant.create({
    ...payload,
    tenantId,
    status: env.smtpHost === "smtp.example.com" ? "ACTIVE" : "PENDING"
  });

  await seedRolesForTenant(tenantId);

  const conn = getTenantConnection(tenantId);
  const User = getUserModel(conn);

  const domain = payload.contactEmail.split("@")[1] || "hospital.local";
  const username = payload.adminUsername || `admin@${domain}`.toLowerCase();
  const password = payload.adminPassword || "Admin@1234";
  const passwordHash = await hashPassword(password);

  await User.create({
    firstName: "Hospital",
    lastName: "Admin",
    email: payload.contactEmail,
    username,
    phone: payload.contactPhone,
    roles: ["HOSPITAL_ADMIN"],
    passwordHash,
    status: "ACTIVE",
    tokenVersion: 0,
    forcePasswordChange: false,
    attributes: {}
  });

  const token = uuid();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await TenantVerificationToken.create({
    tenantId,
    token,
    expiresAt,
    used: false
  });

  const activationLink = `${env.frontendBaseUrl}/activate?tenantId=${tenantId}&token=${token}`;

  await mailer.sendMail({
    to: payload.contactEmail,
    subject: "Hospital Registration - Verify Email",
    text: `Your hospital has been registered.

Tenant ID: ${tenantId}
Admin username: ${username}
Password: ${password}

Please activate your account using the following link:
${activationLink}`
  });

  return {
    ...tenant.toObject(),
    adminCredentials: {
      username,
      password
    }
  };
};

export const verifyTenant = async (tenantId: string, token: string) => {
  const record = await TenantVerificationToken.findOne({ tenantId, token });
  if (!record || record.used || record.expiresAt < new Date()) {
    throw { status: 400, message: "Invalid or expired token" };
  }
  record.used = true;
  await record.save();

  const tenant = await Tenant.findOne({ tenantId });
  if (!tenant) throw { status: 404, message: "Tenant not found" };
  tenant.status = "ACTIVE";
  await tenant.save();

  return tenant;
};
