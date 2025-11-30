import { getTenantConnection } from "../config/db";
import { getPatientModel } from "../models/Patient";
import { buildPatientId } from "../utils/ids";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

export const registerPatient = async (
  tenantId: string,
  payload: {
    name: string;
    dob: string;
    gender: string;
    bloodGroup?: string;
    contact: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    type: "OPD" | "IPD";
    department?: string;
    assignedDoctorId?: string;
    confidentialityLevel?: string;
  }
) => {
  const conn = getTenantConnection(tenantId);
  const Patient = getPatientModel(conn);

  const count = await Patient.countDocuments({});
  const patientId = buildPatientId(tenantId, count + 1);

  const patient = await Patient.create({
    patientId,
    ...payload,
    dob: new Date(payload.dob)
  });

  return patient;
};

export const buildPatientFilter = (
  query: any,
  currentUserAttributes?: { department?: string }
) => {
  const filter: any = {};

  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [
      { patientId: regex },
      { name: regex },
      { contact: regex },
      { email: regex }
    ];
  }

  if (query.type) filter.type = query.type;
  if (query.department) filter.department = query.department;
  if (query.doctorId) filter.assignedDoctorId = query.doctorId;

  if (query.fromDate || query.toDate) {
    filter.createdAt = {};
    if (query.fromDate) filter.createdAt.$gte = new Date(query.fromDate);
    if (query.toDate) filter.createdAt.$lte = new Date(query.toDate);
  }

  // Removed automatic department filtering - receptionists should see all patients
  // Department filtering only applied when explicitly requested via query.department

  return filter;
};

export const searchPatients = async (
  tenantId: string,
  query: {
    search?: string;
    type?: "OPD" | "IPD";
    department?: string;
    doctorId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
  },
  currentUserAttributes?: { department?: string }
) => {
  const conn = getTenantConnection(tenantId);
  const Patient = getPatientModel(conn);

  const filter = buildPatientFilter(query, currentUserAttributes);

  const page = Number(query.page || 1);
  const pageSize = 20;

  const [items, total] = await Promise.all([
    Patient.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    Patient.countDocuments(filter)
  ]);

  return { items, total, page, pageSize };
};

export const exportPatientsCsv = async (
  tenantId: string,
  query: any,
  currentUserAttributes?: { department?: string }
): Promise<string> => {
  const conn = getTenantConnection(tenantId);
  const Patient = getPatientModel(conn);
  const filter = buildPatientFilter(query, currentUserAttributes);
  const items = await Patient.find(filter);

  const header = [
    "patientId",
    "name",
    "dob",
    "gender",
    "bloodGroup",
    "contact",
    "email",
    "type",
    "department"
  ];
  const rows = [header.join(",")];
  for (const p of items) {
    rows.push(
      [
        p.patientId,
        JSON.stringify(p.name || ""),
        p.dob ? p.dob.toISOString().slice(0, 10) : "",
        p.gender || "",
        p.bloodGroup || "",
        p.contact || "",
        p.email || "",
        p.type || "",
        p.department || ""
      ].join(",")
    );
  }
  return rows.join("\n");
};

export const exportPatientsPdfStream = async (
  tenantId: string,
  query: any,
  currentUserAttributes?: { department?: string }
): Promise<Readable> => {
  const conn = getTenantConnection(tenantId);
  const Patient = getPatientModel(conn);
  const filter = buildPatientFilter(query, currentUserAttributes);
  const items = await Patient.find(filter);

  const doc = new PDFDocument({ margin: 30 });
  const stream = new Readable().wrap(doc as any);

  doc.fontSize(16).text("Patients Report", { underline: true });
  doc.moveDown();

  items.forEach((p) => {
    doc.fontSize(10).text(
      `${p.patientId} - ${p.name} - ${p.type} - ${p.contact} - ${p.department || ""}`
    );
  });

  doc.end();
  return stream;
};

export const convertPatientToIpd = async (
  tenantId: string,
  patientId: string
) => {
  const conn = getTenantConnection(tenantId);
  const Patient = getPatientModel(conn);

  const patient = await Patient.findOne({ patientId });
  if (!patient) {
    throw { status: 404, message: "Patient not found" };
  }

  if (patient.type === "IPD") {
    throw { status: 400, message: "Patient is already IPD" };
  }

  patient.type = "IPD";
  await patient.save();

  return patient;
};
