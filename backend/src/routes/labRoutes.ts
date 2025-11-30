import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";
import { getTenantConnection } from "../config/db";
import { getLabRequestModel } from "../models/LabRequest";
import { getPatientModel } from "../models/Patient";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { saveLabResult } from "../utils/storage";

const router = Router();

// Create Lab Request (Doctor only)
router.post(
    "/",
    authenticate,
    requirePermission("LAB:CREATE"),
    async (req, res) => {
        try {
            const tenantId = req.tenantId!;
            const conn = getTenantConnection(tenantId);
            const LabRequest = getLabRequestModel(conn);

            const { patientId, type, notes } = req.body;
            const doctorId = req.user!.id;

            // Simple ID generation for now
            const requestId = `LAB-${Date.now()}`;

            const labRequest = await LabRequest.create({
                requestId,
                patientId,
                doctorId,
                type,
                notes
            });

            res.status(201).json(labRequest);
        } catch (error) {
            console.error("Error creating lab request:", error);
            res.status(500).json({ message: "Failed to create lab request" });
        }
    }
);

// List Lab Requests (Lab Tech & Doctor)
router.get(
    "/",
    authenticate,
    requirePermission("LAB:READ"),
    async (req, res) => {
        try {
            const tenantId = req.tenantId!;
            const conn = getTenantConnection(tenantId);
            const LabRequest = getLabRequestModel(conn);
            const Patient = getPatientModel(conn);

            const { status, patientId } = req.query;
            const filter: any = {};
            if (status) filter.status = status;
            if (patientId) filter.patientId = patientId;

            const requests = await LabRequest.find(filter).sort({ createdAt: -1 });

            // Enrich with patient names
            const patientIds = [...new Set(requests.map((r) => r.patientId))];
            const patients = await Patient.find({ patientId: { $in: patientIds } }).select("patientId name");

            const patientMap = new Map(patients.map((p) => [p.patientId, p.name]));

            const enrichedRequests = requests.map((r) => ({
                ...r.toObject(),
                patientName: patientMap.get(r.patientId) || "Unknown"
            }));

            res.json(enrichedRequests);
        } catch (error) {
            console.error("Error fetching lab requests:", error);
            res.status(500).json({ message: "Failed to fetch lab requests" });
        }
    }
);

// Update Status (Lab Tech only)
router.patch(
    "/:id/status",
    authenticate,
    requirePermission("LAB:UPDATE"),
    async (req, res) => {
        try {
            const tenantId = req.tenantId!;
            const conn = getTenantConnection(tenantId);
            const LabRequest = getLabRequestModel(conn);

            const { status } = req.body;
            const { id } = req.params;

            const updated = await LabRequest.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );

            if (!updated) {
                return res.status(404).json({ message: "Lab request not found" });
            }

            res.json(updated);
        } catch (error) {
            console.error("Error updating lab request:", error);
            res.status(500).json({ message: "Failed to update lab request" });
        }
    }
);

// Upload Result (Lab Tech only)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post(
    "/:id/results",
    authenticate,
    requirePermission("LAB:UPDATE"),
    upload.single("file"),
    async (req, res) => {
        try {
            const tenantId = req.tenantId!;
            const conn = getTenantConnection(tenantId);
            const LabRequest = getLabRequestModel(conn);
            const { id } = req.params;
            const { comments } = req.body;
            const file = req.file;

            const labRequest = await LabRequest.findById(id);
            if (!labRequest) {
                return res.status(404).json({ message: "Lab request not found" });
            }

            let resultFileUrl;
            if (file) {
                resultFileUrl = await saveLabResult({
                    tenantId,
                    requestId: labRequest.requestId,
                    buffer: file.buffer,
                    mimetype: file.mimetype,
                    originalName: file.originalname
                });
            }

            labRequest.status = "COMPLETED";
            if (comments) labRequest.resultComments = comments;
            if (resultFileUrl) labRequest.resultFileUrl = resultFileUrl;

            await labRequest.save();

            res.json(labRequest);
        } catch (error) {
            console.error("Error uploading lab result:", error);
            res.status(500).json({ message: "Failed to upload lab result" });
        }
    }
);

export default router;
