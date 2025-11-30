import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid
} from "@mui/material";
import { apiFetch } from "../../api/client";

interface VitalsEntryDialogProps {
    open: boolean;
    patientId: string;
    patientName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const VitalsEntryDialog = ({
    open,
    patientId,
    patientName,
    onClose,
    onSuccess
}: VitalsEntryDialogProps) => {
    const [form, setForm] = useState({
        temperature: "",
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        heartRate: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        notes: ""
    });

    const handleSubmit = async () => {
        const payload = {
            temperature: form.temperature ? parseFloat(form.temperature) : undefined,
            bloodPressureSystolic: form.bloodPressureSystolic
                ? parseInt(form.bloodPressureSystolic)
                : undefined,
            bloodPressureDiastolic: form.bloodPressureDiastolic
                ? parseInt(form.bloodPressureDiastolic)
                : undefined,
            heartRate: form.heartRate ? parseInt(form.heartRate) : undefined,
            respiratoryRate: form.respiratoryRate
                ? parseInt(form.respiratoryRate)
                : undefined,
            oxygenSaturation: form.oxygenSaturation
                ? parseInt(form.oxygenSaturation)
                : undefined,
            notes: form.notes || undefined
        };

        await apiFetch(`/patients/${patientId}/vitals`, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        setForm({
            temperature: "",
            bloodPressureSystolic: "",
            bloodPressureDiastolic: "",
            heartRate: "",
            respiratoryRate: "",
            oxygenSaturation: "",
            notes: ""
        });

        onSuccess();
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Record Vitals - {patientName}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Temperature (°C)"
                            type="number"
                            value={form.temperature}
                            onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Heart Rate (bpm)"
                            type="number"
                            value={form.heartRate}
                            onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="BP Systolic"
                            type="number"
                            value={form.bloodPressureSystolic}
                            onChange={(e) =>
                                setForm({ ...form, bloodPressureSystolic: e.target.value })
                            }
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="BP Diastolic"
                            type="number"
                            value={form.bloodPressureDiastolic}
                            onChange={(e) =>
                                setForm({ ...form, bloodPressureDiastolic: e.target.value })
                            }
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Respiratory Rate"
                            type="number"
                            value={form.respiratoryRate}
                            onChange={(e) =>
                                setForm({ ...form, respiratoryRate: e.target.value })
                            }
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="O2 Saturation (%)"
                            type="number"
                            value={form.oxygenSaturation}
                            onChange={(e) =>
                                setForm({ ...form, oxygenSaturation: e.target.value })
                            }
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
                    Save Vitals
                </Button>
            </DialogActions>
        </Dialog>
    );
};
