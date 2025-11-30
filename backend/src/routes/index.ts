import { Router } from "express";
import authRoutes from "./authRoutes";
import oauthRoutes from "./oauthRoutes";
import tenantRoutes from "./tenantRoutes";
import userRoutes from "./userRoutes";
import patientRoutes from "./patientRoutes";
import prescriptionRoutes from "./prescriptionRoutes";
import uploadRoutes from "./uploadRoutes";
import roleRoutes from "./roleRoutes";
import vitalsRoutes from "./vitalsRoutes";
import appointmentRoutes from "./appointmentRoutes";
import labRoutes from "./labRoutes";
import dashboardRoutes from "./dashboardRoutes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/oauth", oauthRoutes);
routes.use("/tenants", tenantRoutes);
routes.use("/users", userRoutes);
routes.use("/patients", patientRoutes);
routes.use("/patients", vitalsRoutes);
routes.use("/appointments", appointmentRoutes);
routes.use("/prescriptions", prescriptionRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/lab-requests", labRoutes);
routes.use("/uploads", uploadRoutes);
routes.use("/roles", roleRoutes);
