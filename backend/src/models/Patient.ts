import { Connection, Schema, Document } from "mongoose";

export type PatientType = "OPD" | "IPD";

export interface IPatient extends Document {
  patientId: string;
  name: string;
  dob: Date;
  gender: string;
  bloodGroup?: string;
  contact: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  type: PatientType;
  department?: string;
  assignedDoctorId?: string;
  confidentialityLevel?: string;
  photoUrl?: string;
}

const PatientSchema = new Schema<IPatient>(
  {
    patientId: { type: String, required: true, unique: true },
    name: String,
    dob: Date,
    gender: String,
    bloodGroup: String,
    contact: String,
    email: String,
    address: String,
    emergencyContact: String,
    type: { type: String, enum: ["OPD", "IPD"], required: true },
    department: String,
    assignedDoctorId: String,
    confidentialityLevel: { type: String, default: "NORMAL" },
    photoUrl: String
  },
  { timestamps: true }
);

export const getPatientModel = (conn: Connection) =>
  conn.model<IPatient>("Patient", PatientSchema);
