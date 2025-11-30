import mongoose, { Schema, Document } from "mongoose";

export interface ITenantVerificationToken extends Document {
  tenantId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

const TenantVerificationTokenSchema = new Schema<ITenantVerificationToken>(
  {
    tenantId: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const TenantVerificationToken = mongoose.model<ITenantVerificationToken>(
  "TenantVerificationToken",
  TenantVerificationTokenSchema
);
