import { useState } from "react";
import { Box, Paper, Typography, TextField, Button, MenuItem } from "@mui/material";
import { apiFetch } from "../../api/client";
import { useTranslation } from "react-i18next";

import { useNavigate } from "react-router-dom";

const PatientCreatePage = () => {
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    contact: "",
    email: "",
    address: "",
    emergencyContact: "",
    type: "OPD"
  });
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSuccess(false);
    try {
      console.log("Registering patient:", form);
      const result = await apiFetch("/patients", {
        method: "POST",
        body: JSON.stringify(form)
      });
      console.log("Patient registered:", result);
      console.log("Patient ID:", result?.patientId, "Type:", result?.type);
      setSuccess(true);
      setMessage(t("patients.registeredMessage") || "Patient registered successfully!");

      // Redirect to patient list after 2 seconds
      setTimeout(() => {
        const listPath = form.type === "OPD" ? "/patients/opd" : "/patients/ipd";
        console.log("Redirecting to:", listPath);
        navigate(listPath);
      }, 2000);
    } catch (err: any) {
      console.error("Patient registration error:", err);
      setMessage(err?.message || t("patients.registerFailed") || "Registration failed");
    }
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>{t("patients.registerTitle")}</Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label={t("patients.name")} margin="normal"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <TextField
            fullWidth label={t("patients.dob")} type="date" margin="normal"
            InputLabelProps={{ shrink: true }}
            value={form.dob}
            onChange={(e) => handleChange("dob", e.target.value)}
          />
          <TextField
            fullWidth select label={t("patients.gender")} margin="normal"
            value={form.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField
            fullWidth label={t("patients.bloodGroup")} margin="normal"
            value={form.bloodGroup}
            onChange={(e) => handleChange("bloodGroup", e.target.value)}
          />
          <TextField
            fullWidth label={t("patients.contact")} margin="normal"
            value={form.contact}
            onChange={(e) => handleChange("contact", e.target.value)}
          />
          <TextField
            fullWidth label={t("patients.email")} margin="normal"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <TextField
            fullWidth label={t("patients.address")} margin="normal"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          <TextField
            fullWidth label={t("patients.emergencyContact")} margin="normal"
            value={form.emergencyContact}
            onChange={(e) => handleChange("emergencyContact", e.target.value)}
          />
          <TextField
            fullWidth select label={t("patients.type")} margin="normal"
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value)}
          >
            <MenuItem value="OPD">{t("patients.opd")}</MenuItem>
            <MenuItem value="IPD">{t("patients.ipd")}</MenuItem>
          </TextField>
          {message && (
            <Typography mt={1} color={success ? "success.main" : "error.main"}>
              {message}
            </Typography>
          )}
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            {t("patients.save")}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default PatientCreatePage;
