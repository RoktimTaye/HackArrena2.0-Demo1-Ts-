import { Connection, Schema, Document } from "mongoose";

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface IAppointment extends Document {
    patientId: string;
    doctorId: string;
    appointmentDate: Date;
    duration: number;
    status: AppointmentStatus;
    notes?: string;
    createdBy: string;
}

const AppointmentSchema = new Schema<IAppointment>(
    {
        patientId: { type: String, required: true },
        doctorId: { type: String, required: true },
        appointmentDate: { type: Date, required: true },
        duration: { type: Number, default: 30 },
        status: {
            type: String,
            enum: ["SCHEDULED", "COMPLETED", "CANCELLED"],
            default: "SCHEDULED"
        },
        notes: String,
        createdBy: { type: String, required: true }
    },
    { timestamps: true }
);

AppointmentSchema.index({ patientId: 1, appointmentDate: -1 });
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1 });

export const getAppointmentModel = (conn: Connection) =>
    conn.model<IAppointment>("Appointment", AppointmentSchema);
