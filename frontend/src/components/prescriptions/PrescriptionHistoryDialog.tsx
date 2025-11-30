import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    CircularProgress
} from "@mui/material";
import { apiFetch } from "../../api/client";
import { useTranslation } from "react-i18next";

interface PrescriptionHistoryDialogProps {
    patientId: string;
    patientName: string;
    open: boolean;
    onClose: () => void;
}

export const PrescriptionHistoryDialog = ({
    patientId,
    patientName,
    open,
    onClose
}: PrescriptionHistoryDialogProps) => {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (open && patientId) {
            loadPrescriptions();
        }
    }, [open, patientId]);

    const loadPrescriptions = async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/prescriptions?patientId=${patientId}`);
            setPrescriptions(data);
        } catch (error) {
            console.error("Failed to load prescriptions", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {t("prescriptions.historyTitle", { name: patientName })}
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : prescriptions.length === 0 ? (
                    <Typography align="center" py={3}>
                        {t("prescriptions.noHistory")}
                    </Typography>
                ) : (
                    <Box display="flex" flexDirection="column" gap={2}>
                        {prescriptions.map((p) => (
                            <Paper key={p._id} variant="outlined" sx={{ p: 2 }}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        ID: {p.prescriptionId}
                                    </Typography>
                                </Box>

                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t("prescriptions.medicineName")}</TableCell>
                                            <TableCell>{t("prescriptions.dosage")}</TableCell>
                                            <TableCell>{t("prescriptions.frequency")}</TableCell>
                                            <TableCell>{t("prescriptions.duration")}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {p.medicines.map((m: any, idx: number) => (
                                            <TableRow key={idx}>
                                                <TableCell>{m.name}</TableCell>
                                                <TableCell>{m.dosage}</TableCell>
                                                <TableCell>{m.frequency}</TableCell>
                                                <TableCell>{m.duration}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {p.notes && (
                                    <Box mt={1} bgcolor="#f5f5f5" p={1} borderRadius={1}>
                                        <Typography variant="caption" fontWeight="bold">
                                            {t("prescriptions.notes")}:
                                        </Typography>
                                        <Typography variant="body2">{p.notes}</Typography>
                                    </Box>
                                )}
                            </Paper>
                        ))}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("common.close")}</Button>
            </DialogActions>
        </Dialog>
    );
};
