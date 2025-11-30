import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  MenuItem
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { apiFetch } from "../../api/client";
import { useTranslation } from "react-i18next";

import { useSearchParams } from "react-router-dom";

const PrescriptionCreatePage = () => {
  const [searchParams] = useSearchParams();
  const [patientId, setPatientId] = useState(searchParams.get("patientId") || "");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" }
  ]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    apiFetch("/prescriptions/templates")
      .then(setTemplates)
      .catch(() => { });
  }, []);

  const updateMedicine = (index: number, field: string, value: string) => {
    setMedicines((prev) => {
      const next = [...prev];
      (next[index] as any)[field] = value;
      return next;
    });
  };

  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" }
    ]);
  };

  const removeMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const applyTemplate = (id: string) => {
    setSelectedTemplate(id);
    const tpl = templates.find((t) => t._id === id);
    if (tpl) {
      setMedicines(tpl.medicines || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await apiFetch("/prescriptions", {
        method: "POST",
        body: JSON.stringify({ patientId, medicines })
      });
      setMessage(t("prescriptions.createdMessage"));
    } catch (err: any) {
      setMessage(t("prescriptions.createFailed"));
    }
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>{t("prescriptions.createTitle")}</Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label={t("prescriptions.patientId")} margin="normal"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />

          <TextField
            select
            label={t("prescriptions.template")}
            fullWidth
            margin="normal"
            value={selectedTemplate}
            onChange={(e) => applyTemplate(e.target.value)}
          >
            <MenuItem value="">{t("prescriptions.none")}</MenuItem>
            {templates.map((t) => (
              <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
            ))}
          </TextField>

          {medicines.map((m, index) => (
            <Box key={index} display="flex" gap={2} alignItems="center" mt={2}>
              <TextField
                label={t("prescriptions.medicineName")} value={m.name}
                onChange={(e) => updateMedicine(index, "name", e.target.value)}
              />
              <TextField
                label={t("prescriptions.dosage")} value={m.dosage}
                onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
              />
              <TextField
                label={t("prescriptions.frequency")} value={m.frequency}
                onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
              />
              <TextField
                label={t("prescriptions.duration")} value={m.duration}
                onChange={(e) => updateMedicine(index, "duration", e.target.value)}
              />
              <TextField
                label={t("prescriptions.instructions")} value={m.instructions}
                onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
              />
              <IconButton onClick={() => removeMedicine(index)}>
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addMedicine}
            sx={{ mt: 2 }}
          >
            {t("prescriptions.addMedicine")}
          </Button>
          {message && <Typography mt={2}>{message}</Typography>}
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            {t("prescriptions.savePrescription")}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default PrescriptionCreatePage;
