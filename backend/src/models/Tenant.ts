import mongoose, { Schema, Document } from "mongoose";

export type TenantStatus =
  | "PENDING"
  | "VERIFIED"
  | "ACTIVE"
  | "SUSPENDED"
  | "INACTIVE";

export interface ITenant extends Document {
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  licenseNumber: string;
  tenantId: string;
  status: TenantStatus;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true },
    address: String,
    contactEmail: { type: String, required: true },
    contactPhone: String,
    licenseNumber: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "ACTIVE", "SUSPENDED", "INACTIVE"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

export const Tenant = mongoose.model<ITenant>("Tenant", TenantSchema);
