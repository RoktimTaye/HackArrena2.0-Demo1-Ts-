import { Connection, Schema, Document } from "mongoose";

interface ITemplateMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescriptionTemplate extends Document {
  name: string;
  description?: string;
  medicines: ITemplateMedicine[];
  notes?: string;
}

const PrescriptionTemplateSchema = new Schema<IPrescriptionTemplate>(
  {
    name: { type: String, required: true, unique: true },
    description: String,
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

export const getPrescriptionTemplateModel = (conn: Connection) =>
  conn.model<IPrescriptionTemplate>("PrescriptionTemplate", PrescriptionTemplateSchema);
