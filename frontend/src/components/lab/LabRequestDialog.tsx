import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Typography
} from "@mui/material";
import { apiFetch } from "../../api/client";
import { useTranslation } from "react-i18next";

interface LabRequestDialogProps {
    open: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
    onSuccess?: () => void;
}

export const LabRequestDialog = ({
    open,
    onClose,
    patientId,
    patientName,
    onSuccess
}: LabRequestDialogProps) => {
    const [type, setType] = useState("BLOOD_TEST");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            await apiFetch("/lab-requests", {
                method: "POST",
                body: JSON.stringify({
                    patientId,
                    type,
                    notes
                })
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create lab request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {t("lab.requestTitle", { name: patientName })}
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <TextField
                        select
                        label={t("lab.testType")}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="XRAY">X-Ray</MenuItem>
                        <MenuItem value="BLOOD_TEST">Blood Test</MenuItem>
                        <MenuItem value="VACCINATION">Vaccination</MenuItem>
                    </TextField>

                    <TextField
                        label={t("lab.notes")}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Additional instructions..."
                    />

                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    {t("common.cancel")}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? t("common.saving") : t("lab.sendRequest")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
