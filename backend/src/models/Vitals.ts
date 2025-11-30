import { Connection, Schema, Document } from "mongoose";

export interface IVitals extends Document {
    patientId: string;
    recordedBy: string;
    recordedAt: Date;
    temperature?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    notes?: string;
}

const VitalsSchema = new Schema<IVitals>(
    {
        patientId: { type: String, required: true },
        recordedBy: { type: String, required: true },
        recordedAt: { type: Date, required: true, default: Date.now },
        temperature: Number,
        bloodPressureSystolic: Number,
        bloodPressureDiastolic: Number,
        heartRate: Number,
        respiratoryRate: Number,
        oxygenSaturation: Number,
        notes: String
    },
    { timestamps: true }
);

VitalsSchema.index({ patientId: 1, recordedAt: -1 });

export const getVitalsModel = (conn: Connection) =>
    conn.model<IVitals>("Vitals", VitalsSchema);
