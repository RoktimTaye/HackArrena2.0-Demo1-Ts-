import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete
} from "@mui/material";
import { apiFetch } from "../../api/client";

interface AppointmentBookingDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedPatient?: { patientId: string; name: string } | null;
}

export const AppointmentBookingDialog = ({
    open,
    onClose,
    onSuccess,
    selectedPatient
}: AppointmentBookingDialogProps) => {
    const [form, setForm] = useState({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        duration: "30",
        notes: ""
    });
    const [doctors, setDoctors] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            loadDoctors();
            if (!selectedPatient) {
                loadPatients();
            } else {
                setForm((prev) => ({ ...prev, patientId: selectedPatient.patientId }));
            }
        }
    }, [open, selectedPatient]);

    const loadDoctors = async () => {
        const users = await apiFetch("/users");
        const doctorUsers = users.filter((u: any) =>
            u.roles?.includes("DOCTOR")
        );
        setDoctors(doctorUsers);
    };

    const loadPatients = async () => {
        const data = await apiFetch("/patients");
        setPatients(data.items || []);
    };

    const handleSubmit = async () => {
        const appointmentDateTime = new Date(
            `${form.appointmentDate}T${form.appointmentTime}`
        );

        await apiFetch("/appointments", {
            method: "POST",
            body: JSON.stringify({
                patientId: form.patientId,
                doctorId: form.doctorId,
                appointmentDate: appointmentDateTime.toISOString(),
                duration: parseInt(form.duration),
                notes: form.notes || undefined
            })
        });

        setForm({
            patientId: "",
            doctorId: "",
            appointmentDate: "",
            appointmentTime: "",
            duration: "30",
            notes: ""
        });

        onSuccess();
        onClose();
    };

    const selectedPatientObj = selectedPatient
        ? { patientId: selectedPatient.patientId, name: selectedPatient.name }
        : patients.find((p) => p.patientId === form.patientId);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12}>
                        {selectedPatient ? (
                            <TextField
                                fullWidth
                                label="Patient"
                                value={selectedPatient.name}
                                disabled
                            />
                        ) : (
                            <Autocomplete
                                options={patients}
                                getOptionLabel={(option) => `${option.name} (${option.patientId})`}
                                value={selectedPatientObj || null}
                                onChange={(_, value) =>
                                    setForm({ ...form, patientId: value?.patientId || "" })
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Patient" required />
                                )}
                            />
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel>Doctor</InputLabel>
                            <Select
                                value={form.doctorId}
                                label="Doctor"
                                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                            >
                                {doctors.map((doctor) => (
                                    <MenuItem key={doctor._id} value={doctor._id}>
                                        {doctor.firstName} {doctor.lastName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={7}>
                        <TextField
                            fullWidth
                            label="Date"
                            type="date"
                            value={form.appointmentDate}
                            onChange={(e) =>
                                setForm({ ...form, appointmentDate: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    <Grid item xs={5}>
                        <TextField
                            fullWidth
                            label="Time"
                            type="time"
                            value={form.appointmentTime}
                            onChange={(e) =>
                                setForm({ ...form, appointmentTime: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Duration (minutes)"
                            type="number"
                            value={form.duration}
                            onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={2}
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">
                    Book Appointment
                </Button>
            </DialogActions>
        </Dialog>
    );
};
