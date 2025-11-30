import { Connection, Schema, Document } from "mongoose";

interface IMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  prescriptionId: string;
  patientId: string;
  doctorId: string;
  medicines: IMedicine[];
  notes?: string;
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    prescriptionId: { type: String, unique: true, required: true },
    patientId: { type: String, required: true },
    doctorId: { type: String, required: true },
    medicines: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String
      }
    ],
    notes: String
  },
  { timestamps: true }
);

export const getPrescriptionModel = (conn: Connection) =>
  conn.model<IPrescription>("Prescription", PrescriptionSchema);
