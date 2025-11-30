import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";
import { getTenantConnection } from "../config/db";
import { getAppointmentModel } from "../models/Appointment";
import { getPatientModel } from "../models/Patient";

const router = Router();

router.post(
    "/",
    authenticate,
    requirePermission("APPOINTMENT:CREATE"),
    async (req, res) => {
        const tenantId = req.tenantId!;
        const userId = req.user!.id;

        const conn = getTenantConnection(tenantId);
        const Appointment = getAppointmentModel(conn);

        const appointment = await Appointment.create({
            ...req.body,
            createdBy: userId
        });

        res.status(201).json(appointment);
    }
);

router.get(
    "/",
    authenticate,
    requirePermission("APPOINTMENT:READ"),
    async (req, res) => {
        const tenantId = req.tenantId!;
        const { doctorId, patientId, status, fromDate, toDate } = req.query;

        const conn = getTenantConnection(tenantId);
        const Appointment = getAppointmentModel(conn);
        const Patient = getPatientModel(conn);

        const filter: any = {};
        if (doctorId) filter.doctorId = doctorId;
        if (patientId) filter.patientId = patientId;
        if (status) filter.status = status;
        if (fromDate || toDate) {
            filter.appointmentDate = {};
            if (fromDate) filter.appointmentDate.$gte = new Date(fromDate as string);
            if (toDate) filter.appointmentDate.$lte = new Date(toDate as string);
        }

        const appointments = await Appointment.find(filter)
            .sort({ appointmentDate: 1 })
            .limit(100);

        // Enrich with patient names
        const patientIds = [...new Set(appointments.map((a) => a.patientId))];
        const patients = await Patient.find({ patientId: { $in: patientIds } }).select("patientId name");
        const patientMap = new Map(patients.map((p) => [p.patientId, p.name]));

        const enrichedAppointments = appointments.map((a) => ({
            ...a.toObject(),
            patientName: patientMap.get(a.patientId) || "Unknown"
        }));

        res.json(enrichedAppointments);
    }
);

router.patch(
    "/:id",
    authenticate,
    requirePermission("APPOINTMENT:UPDATE"),
    async (req, res) => {
        const tenantId = req.tenantId!;
        const { id } = req.params;

        const conn = getTenantConnection(tenantId);
        const Appointment = getAppointmentModel(conn);

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.json(appointment);
    }
);

export default router;
