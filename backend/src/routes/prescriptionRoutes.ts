import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";
import { getTenantConnection } from "../config/db";
import { getPrescriptionModel } from "../models/Prescription";
import { getPrescriptionTemplateModel } from "../models/PrescriptionTemplate";
import { buildPrescriptionId } from "../utils/ids";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("PRESCRIPTION:CREATE"),
  async (req, res) => {
    const tenantId = req.tenantId!;
    const conn = getTenantConnection(tenantId);
    const Prescription = getPrescriptionModel(conn);

    const { patientId, medicines, notes } = req.body;
    const doctorId = req.user!.id;

    const count = await Prescription.countDocuments();
    const prescriptionId = buildPrescriptionId(tenantId, count + 1);

    const prescription = await Prescription.create({
      prescriptionId,
      patientId,
      doctorId,
      medicines,
      notes
    });

    res.status(201).json(prescription);
  }
);

router.get(
  "/",
  authenticate,
  requirePermission("PRESCRIPTION:READ"),
  async (req, res) => {
    const tenantId = req.tenantId!;
    const conn = getTenantConnection(tenantId);
    const Prescription = getPrescriptionModel(conn);

    const { patientId } = req.query;
    const filter: any = {};
    if (patientId) filter.patientId = patientId;

    const prescriptions = await Prescription.find(filter).sort({ createdAt: -1 });
    res.json(prescriptions);
  }
);

// Prescription templates
router.post(
  "/templates",
  authenticate,
  requirePermission("PRESCRIPTION:CREATE"),
  async (req, res) => {
    const conn = getTenantConnection(req.tenantId!);
    const Template = getPrescriptionTemplateModel(conn);
    const tpl = await Template.create(req.body);
    res.status(201).json(tpl);
  }
);

router.get(
  "/templates",
  authenticate,
  requirePermission("PRESCRIPTION:READ"),
  async (req, res) => {
    const conn = getTenantConnection(req.tenantId!);
    const Template = getPrescriptionTemplateModel(conn);
    const templates = await Template.find();
    res.json(templates);
  }
);

export default router;
