import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getTenantConnection } from "../config/db";
import { getPatientModel } from "../models/Patient";
import { getAppointmentModel } from "../models/Appointment";
import { getLabRequestModel } from "../models/LabRequest";

const router = Router();

router.get("/stats", authenticate, async (req, res) => {
    try {
        const tenantId = req.tenantId!;
        const user = req.user!;
        const conn = getTenantConnection(tenantId);

        const Patient = getPatientModel(conn);
        const Appointment = getAppointmentModel(conn);
        const LabRequest = getLabRequestModel(conn);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        let stats: any = {};

        if (user.roles.includes("RECEPTIONIST") || user.roles.includes("HOSPITAL_ADMIN")) {
            // Receptionist / Admin Stats
            const totalPatients = await Patient.countDocuments();
            const newPatientsToday = await Patient.countDocuments({
                createdAt: { $gte: todayStart, $lte: todayEnd }
            });
            const appointmentsToday = await Appointment.countDocuments({
                appointmentDate: { $gte: todayStart, $lte: todayEnd },
                status: { $ne: "CANCELLED" }
            });

            stats = {
                totalPatients,
                newPatientsToday,
                appointmentsToday
            };
        } else if (user.roles.includes("DOCTOR")) {
            // Doctor Stats
            const assignedPatients = await Patient.countDocuments({ assignedDoctorId: user.id });
            const appointmentsToday = await Appointment.countDocuments({
                doctorId: user.id,
                appointmentDate: { $gte: todayStart, $lte: todayEnd },
                status: { $ne: "CANCELLED" }
            });
            const pendingLabRequests = await LabRequest.countDocuments({
                doctorId: user.id,
                status: "PENDING"
            });

            stats = {
                assignedPatients,
                appointmentsToday,
                pendingLabRequests
            };
        }

        res.json(stats);
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
});

export default router;
