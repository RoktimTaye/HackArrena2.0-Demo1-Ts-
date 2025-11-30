import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";
import { getTenantConnection } from "../config/db";
import { getVitalsModel } from "../models/Vitals";

const router = Router();

router.post(
    "/:patientId/vitals",
    authenticate,
    requirePermission("VITALS:CREATE"),
    async (req, res) => {
        const tenantId = req.tenantId!;
        const userId = req.user!.id;
        const { patientId } = req.params;

        const conn = getTenantConnection(tenantId);
        const Vitals = getVitalsModel(conn);

        const vitals = await Vitals.create({
            patientId,
            recordedBy: userId,
            recordedAt: new Date(),
            ...req.body
        });

        res.status(201).json(vitals);
    }
);

router.get(
    "/:patientId/vitals",
    authenticate,
    requirePermission("PATIENT:READ"),
    async (req, res) => {
        const tenantId = req.tenantId!;
        const { patientId } = req.params;

        const conn = getTenantConnection(tenantId);
        const Vitals = getVitalsModel(conn);

        const vitals = await Vitals.find({ patientId })
            .sort({ recordedAt: -1 })
            .limit(50);

        res.json(vitals);
    }
);

export default router;
