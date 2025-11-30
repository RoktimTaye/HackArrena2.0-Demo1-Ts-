import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/",
  MONGO_TENANT_URI_TEMPLATE: "mongodb://localhost:27017/hms_%s",
  jwtSecret: process.env.JWT_SECRET || "super-secret",
  jwtExpiresIn: "1h",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "super-refresh-secret",
  jwtRefreshExpiresIn: "7d",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  smtpHost: process.env.SMTP_HOST || "smtp.example.com",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || "http://localhost:5173",
  storageProvider: process.env.STORAGE_PROVIDER || "local",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  s3Bucket: process.env.S3_BUCKET || "",
  s3Region: process.env.S3_REGION || "eu-central-1"
};
