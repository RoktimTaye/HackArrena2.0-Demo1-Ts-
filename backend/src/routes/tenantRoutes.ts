import { Router } from "express";
import { registerHospital, verifyTenant } from "../services/tenantService";

const router = Router();

router.post("/register", async (req, res) => {
  const { name, address, contactEmail, contactPhone, licenseNumber, adminUsername, adminPassword } = req.body;
  const tenant = await registerHospital({
    name,
    address,
    contactEmail,
    contactPhone,
    licenseNumber,
    adminUsername,
    adminPassword
  });
  res.status(201).json(tenant);
});

router.get("/verify", async (req, res) => {
  const { tenantId, token } = req.query as { tenantId: string; token: string };
  const tenant = await verifyTenant(tenantId, token);
  res.json({ message: "Tenant verified", tenant });
});

export default router;
