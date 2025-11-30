import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { VitalsEntryDialog } from "../../components/vitals/VitalsEntryDialog";
import { useAuth } from "../../context/AuthContext";
import { AssignDoctorDialog } from "../../components/appointments/AssignDoctorDialog";
import { AppointmentBookingDialog } from "../../components/appointments/AppointmentBookingDialog";

import { useNavigate } from "react-router-dom";

import { PrescriptionHistoryDialog } from "../../components/prescriptions/PrescriptionHistoryDialog";
import { LabRequestDialog } from "../../components/lab/LabRequestDialog";

const PatientListPage = ({ defaultType = "" }: { defaultType?: "OPD" | "IPD" | "" }) => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState(defaultType); // Use defaultType from props
  const [patients, setPatients] = useState<any[]>([]);
  const [convertDialog, setConvertDialog] = useState<string | null>(null);
  const [vitalsDialog, setVitalsDialog] = useState<{ patientId: string; name: string } | null>(null);
  const [assignDoctorDialog, setAssignDoctorDialog] = useState<{ patientId: string; name: string; doctorId?: string } | null>(null);
  const [appointmentDialog, setAppointmentDialog] = useState<{ patientId: string; name: string } | null>(null);
  const [historyDialog, setHistoryDialog] = useState<{ patientId: string; name: string } | null>(null);
  const [labDialog, setLabDialog] = useState<{ patientId: string; name: string } | null>(null);
  const { t } = useTranslation();
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const typeParam = type ? `&type=${type}` : "";
      const url = `/patients?search=${encodeURIComponent(search)}${typeParam}`;
      console.log("Loading patients with params:", { search, type, typeParam, fullUrl: url });
      const data = await apiFetch(url);
      console.log("Received patient data:", data);
      console.log("Number of patients:", data?.items?.length, "Total:", data?.total);
      setPatients(data?.items || []);
    } catch (error) {
      console.error("Error loading patients:", error);
      setPatients([]);
    }
  };

  useEffect(() => {
    load();
  }, [type, search]);

  const exportCsv = async () => {
    const tokenData = localStorage.getItem("hms_auth");
    const headers: any = {};
    if (tokenData) {
      const { accessToken } = JSON.parse(tokenData);
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const typeParam = type ? `&type=${type}` : "";
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const resp = await fetch(
      `${baseUrl}/api/patients/export/csv?search=${encodeURIComponent(
        search
      )}${typeParam}`,
      { headers }
    );
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patients.csv";
    a.click();
  };

  const handleConvertToIpd = async (patientId: string) => {
    await apiFetch(`/patients/${patientId}/convert-to-ipd`, { method: "PATCH" });
    setConvertDialog(null);
    load(); // Reload the list
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>{t("patients.title")}</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2}>
          <TextField
            label={t("patients.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>{t("patients.type")}</InputLabel>
            <Select
              value={type}
              label={t("patients.type")}
              onChange={(e) => setType(e.target.value as "" | "OPD" | "IPD")}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="OPD">OPD</MenuItem>
              <MenuItem value="IPD">IPD</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={load}>{t("patients.search")}</Button>
          <Button variant="outlined" onClick={exportCsv}>{t("patients.exportCsv")}</Button>
        </Box>
      </Paper>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("patients.table.patientId")}</TableCell>
              <TableCell>{t("patients.name")}</TableCell>
              <TableCell>{t("patients.type")}</TableCell>
              <TableCell>{t("patients.contact")}</TableCell>
              <TableCell>{t("patients.table.department")}</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((p) => (
              <TableRow key={p._id}>
                <TableCell>{p.patientId}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.type}</TableCell>
                <TableCell>{p.contact}</TableCell>
                <TableCell>{p.department}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    {p.type === "OPD" && (user?.roles?.includes("NURSE") || user?.roles?.includes("RECEPTIONIST")) && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => setConvertDialog(p.patientId)}
                      >
                        Convert to IPD
                      </Button>
                    )}
                    {hasPermission("PATIENT:UPDATE") && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setAssignDoctorDialog({ patientId: p.patientId, name: p.name, doctorId: p.assignedDoctorId })}
                      >
                        Assign Doctor
                      </Button>
                    )}
                    {hasPermission("APPOINTMENT:CREATE") && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => setAppointmentDialog({ patientId: p.patientId, name: p.name })}
                      >
                        Book Appointment
                      </Button>
                    )}
                    {hasPermission("VITALS:CREATE") && (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() => setVitalsDialog({ patientId: p.patientId, name: p.name })}
                      >
                        Record Vitals
                      </Button>
                    )}
                    {hasPermission("PRESCRIPTION:CREATE") && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => navigate(`/prescriptions/new?patientId=${p.patientId}`)}
                        >
                          Prescribe
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="info"
                          onClick={() => setHistoryDialog({ patientId: p.patientId, name: p.name })}
                        >
                          History
                        </Button>
                      </>
                    )}
                    {hasPermission("LAB:CREATE") && (
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        onClick={() => setLabDialog({ patientId: p.patientId, name: p.name })}
                      >
                        Lab Request
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {convertDialog && (
        <Dialog open={!!convertDialog} onClose={() => setConvertDialog(null)}>
          <DialogTitle>Confirm Conversion</DialogTitle>
          <DialogContent>
            Are you sure you want to convert this patient to IPD?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConvertDialog(null)}>Cancel</Button>
            <Button onClick={() => convertDialog && handleConvertToIpd(convertDialog)} variant="contained" color="primary">
              Convert
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {vitalsDialog && (
        <VitalsEntryDialog
          open={!!vitalsDialog}
          onClose={() => setVitalsDialog(null)}
          patientId={vitalsDialog.patientId}
          patientName={vitalsDialog.name}
          onSuccess={() => {
            setVitalsDialog(null);
            load();
          }}
        />
      )}

      {assignDoctorDialog && (
        <AssignDoctorDialog
          open={!!assignDoctorDialog}
          onClose={() => setAssignDoctorDialog(null)}
          patientId={assignDoctorDialog.patientId}
          patientName={assignDoctorDialog.name}
          currentDoctorId={assignDoctorDialog.doctorId}
          onSuccess={load}
        />
      )}

      {appointmentDialog && (
        <AppointmentBookingDialog
          open={!!appointmentDialog}
          onClose={() => setAppointmentDialog(null)}
          selectedPatient={appointmentDialog}
          onSuccess={() => {
            setAppointmentDialog(null);
          }}
        />
      )}

      {historyDialog && (
        <PrescriptionHistoryDialog
          open={!!historyDialog}
          onClose={() => setHistoryDialog(null)}
          patientId={historyDialog.patientId}
          patientName={historyDialog.name}
        />
      )}

      {labDialog && (
        <LabRequestDialog
          open={!!labDialog}
          onClose={() => setLabDialog(null)}
          patientId={labDialog.patientId}
          patientName={labDialog.name}
          onSuccess={() => {
            // Optional: show success message
          }}
        />
      )}
    </Box>
  );
};

export default PatientListPage;
