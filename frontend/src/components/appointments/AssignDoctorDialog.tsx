import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { apiFetch } from "../../api/client";

interface AssignDoctorDialogProps {
    open: boolean;
    patientId: string;
    patientName: string;
    currentDoctorId?: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const AssignDoctorDialog = ({
    open,
    patientId,
    patientName,
    currentDoctorId,
    onClose,
    onSuccess
}: AssignDoctorDialogProps) => {
    const [doctorId, setDoctorId] = useState(currentDoctorId || "");
    const [doctors, setDoctors] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            loadDoctors();
        }
    }, [open]);

    useEffect(() => {
        setDoctorId(currentDoctorId || "");
    }, [currentDoctorId]);

    const loadDoctors = async () => {
        const users = await apiFetch("/users");
        const doctorUsers = users.filter((u: any) =>
            u.roles?.includes("DOCTOR")
        );
        setDoctors(doctorUsers);
    };

    const handleSubmit = async () => {
        await apiFetch(`/patients/${patientId}/assign-doctor`, {
            method: "PATCH",
            body: JSON.stringify({ doctorId })
        });

        onSuccess();
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Assign Doctor - {patientName}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Doctor</InputLabel>
                    <Select
                        value={doctorId}
                        label="Doctor"
                        onChange={(e) => setDoctorId(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {doctors.map((doctor) => (
                            <MenuItem key={doctor._id} value={doctor._id}>
                                {doctor.firstName} {doctor.lastName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">
                    Assign
                </Button>
            </DialogActions>
        </Dialog>
    );
};
