import { Schema, Connection, Document, Model } from "mongoose";

export interface ILabRequest extends Document {
    requestId: string;
    patientId: string;
    doctorId: string;
    type: "XRAY" | "BLOOD_TEST" | "VACCINATION";
    status: "PENDING" | "COMPLETED";
    notes?: string;
    resultFileUrl?: string;
    resultComments?: string;
    createdAt: Date;
    updatedAt: Date;
}

const labRequestSchema = new Schema<ILabRequest>(
    {
        requestId: { type: String, required: true, unique: true },
        patientId: { type: String, required: true, index: true },
        doctorId: { type: String, required: true },
        type: {
            type: String,
            enum: ["XRAY", "BLOOD_TEST", "VACCINATION"],
            required: true
        },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED"],
            default: "PENDING"
        },
        notes: { type: String },
        resultFileUrl: { type: String },
        resultComments: { type: String }
    },
    { timestamps: true }
);

export const getLabRequestModel = (conn: Connection): Model<ILabRequest> => {
    return conn.model<ILabRequest>("LabRequest", labRequestSchema);
};
