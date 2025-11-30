import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requirePermission } from "../middleware/rbac";
import { registerPatient, searchPatients, exportPatientsCsv, exportPatientsPdfStream, convertPatientToIpd } from "../services/patientService";
import { getTenantConnection } from "../config/db";
import { getPatientModel } from "../models/Patient";

const router = Router();

router.post(
  "/",
  authenticate,
  requirePermission("PATIENT:CREATE"),
  async (req, res) => {
    const tenantId = req.tenantId!;
    const patient = await registerPatient(tenantId, req.body);
    res.status(201).json(patient);
  }
);

router.get(
  "/",
  authenticate,
  requirePermission("PATIENT:READ"),
  async (req, res) => {
    const tenantId = req.tenantId!;
    const result = await searchPatients(
      tenantId,
      {
        search: req.query.search as string,
        type: req.query.type as any,
        department: req.query.department as string,
        doctorId: req.query.doctorId as string,
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        page: Number(req.query.page || 1)
      },
      req.user?.attributes
    );
    res.json(result);
  }
);

router.get(
  "/export/csv",
  authenticate,
  requirePermission("PATIENT:READ"),
  async (req, res) => {
    const csv = await exportPatientsCsv(
      req.tenantId!,
      req.query,
      req.user?.attributes
    );
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=\"patients.csv\"");
    res.send(csv);
  }
);

router.get(
  "/export/pdf",
  authenticate,
  requirePermission("PATIENT:READ"),
  async (req, res) => {
    const stream = await exportPatientsPdfStream(
      req.tenantId!,
      req.query,
      req.user?.attributes
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=\"patients.pdf\"");
    stream.pipe(res);
  }
);

router.patch(
  "/:patientId/convert-to-ipd",
  authenticate,
  requirePermission("PATIENT:UPDATE"),
  async (req, res) => {
    const tenantId = req.tenantId!;
    const patient = await convertPatientToIpd(tenantId, req.params.patientId);
    res.json(patient);
  }
);

router.patch(
  "/:patientId/assign-doctor",
  authenticate,
  requirePermission("PATIENT:UPDATE"),
  async (req, res) => {
    const tenantId = req.tenantId!;
    const { patientId } = req.params;
    const { doctorId } = req.body;

    const conn = getTenantConnection(tenantId);
    const Patient = getPatientModel(conn);

    const patient = await Patient.findOneAndUpdate(
      { patientId },
      { assignedDoctorId: doctorId },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  }
);

router.get(
  "/:patientId",
  authenticate,
  requirePermission("PATIENT:READ"),
  async (req, res) => {
    const tenantId = req.tenantId!;
    const conn = getTenantConnection(tenantId);
    const Patient = getPatientModel(conn);
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) return res.status(404).json({ message: "Not found" });
    res.json(patient);
  }
);

export default router;
