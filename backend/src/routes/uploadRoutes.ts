import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";
import { getTenantConnection } from "../config/db";
import { getPatientModel } from "../models/Patient";
import { savePatientPhoto } from "../utils/storage";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Only JPG/PNG allowed"));
    }
  }
});

router.post(
  "/patients/:patientId/photo",
  authenticate,
  requirePermission("PATIENT:UPDATE"),
  upload.single("photo"),
  async (req, res) => {
    const tenantId = req.tenantId!;
    const { patientId } = req.params;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Photo file is required" });
    }

    const url = await savePatientPhoto({
      tenantId,
      patientId,
      buffer: file.buffer,
      mimetype: file.mimetype
    });

    const conn = getTenantConnection(tenantId);
    const Patient = getPatientModel(conn);
    const patient = await Patient.findOneAndUpdate(
      { patientId },
      { photoUrl: url },
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ photoUrl: url, patient });
  }
);

export default router;
