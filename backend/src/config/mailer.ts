import nodemailer from "nodemailer";
import { env } from "./env";

export const mailer = env.smtpHost === "smtp.example.com"
  ? nodemailer.createTransport({
    jsonTransport: true
  })
  : nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: false,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

if (env.smtpHost === "smtp.example.com") {
  console.log("⚠️  SMTP is not configured. Emails will be suppressed (JSON Transport).");
}
