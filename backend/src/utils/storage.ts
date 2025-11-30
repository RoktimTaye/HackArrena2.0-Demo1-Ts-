import fs from "fs";
import path from "path";
import { env } from "../config/env";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: env.s3Region });

export const savePatientPhoto = async ({
  tenantId,
  patientId,
  buffer,
  mimetype
}: {
  tenantId: string;
  patientId: string;
  buffer: Buffer;
  mimetype: string;
}): Promise<string> => {
  if (env.storageProvider === "s3") {
    const key = `patients/${tenantId}/${patientId}.jpg`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        ACL: "public-read"
      })
    );
    return `https://${env.s3Bucket}.s3.${env.s3Region}.amazonaws.com/${key}`;
  } else {
    const uploadRoot = path.join(process.cwd(), env.uploadDir, tenantId);
    if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });
    const filePath = path.join(uploadRoot, `${patientId}.jpg`);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${tenantId}/${patientId}.jpg`;
  }
};

export const saveLabResult = async ({
  tenantId,
  requestId,
  buffer,
  mimetype,
  originalName
}: {
  tenantId: string;
  requestId: string;
  buffer: Buffer;
  mimetype: string;
  originalName: string;
}): Promise<string> => {
  const ext = path.extname(originalName);
  const filename = `${requestId}${ext}`;

  if (env.storageProvider === "s3") {
    const key = `lab-results/${tenantId}/${filename}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        ACL: "public-read"
      })
    );
    return `https://${env.s3Bucket}.s3.${env.s3Region}.amazonaws.com/${key}`;
  } else {
    const uploadRoot = path.join(process.cwd(), env.uploadDir, tenantId, "lab-results");
    if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });
    const filePath = path.join(uploadRoot, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${tenantId}/lab-results/${filename}`;
  }
};
