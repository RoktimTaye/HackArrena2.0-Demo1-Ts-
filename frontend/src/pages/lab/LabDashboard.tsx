import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from "@mui/material";
import { apiFetch } from "../../api/client";
import { useTranslation } from "react-i18next";

export const LabDashboard = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadDialog, setUploadDialog] = useState<{ id: string; type: string } | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [comments, setComments] = useState("");
    const [uploading, setUploading] = useState(false);
    const { t } = useTranslation();

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await apiFetch("/lab-requests");
            setRequests(data);
        } catch (error) {
            console.error("Failed to load lab requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleComplete = async () => {
        if (!uploadDialog) return;

        setUploading(true);
        try {
            const formData = new FormData();
            if (file) formData.append("file", file);
            if (comments) formData.append("comments", comments);

            const tokenData = localStorage.getItem("hms_auth");
            const headers: any = {};
            if (tokenData) {
                const { accessToken } = JSON.parse(tokenData);
                headers["Authorization"] = `Bearer ${accessToken}`;
            }

            const response = await fetch(`http://localhost:4000/api/lab-requests/${uploadDialog.id}/results`, {
                method: "POST",
                headers,
                body: formData
            });

            if (!response.ok) throw new Error("Failed to upload results");

            setUploadDialog(null);
            setFile(null);
            setComments("");
            loadRequests();
        } catch (error) {
            console.error("Failed to complete request", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">{t("lab.dashboardTitle", "Lab Dashboard")}</Typography>
                <Button variant="outlined" onClick={loadRequests}>
                    {t("common.refresh", "Refresh")}
                </Button>
            </Box>

            <Paper>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t("lab.requestId", "Request ID")}</TableCell>
                                <TableCell>{t("lab.patient", "Patient")}</TableCell>
                                <TableCell>{t("lab.type", "Type")}</TableCell>
                                <TableCell>{t("lab.notes", "Notes")}</TableCell>
                                <TableCell>{t("lab.status", "Status")}</TableCell>
                                <TableCell>{t("lab.actions", "Actions")}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((req) => (
                                <TableRow key={req._id}>
                                    <TableCell>{req.requestId}</TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                {req.patientName}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {req.patientId}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={req.type}
                                            color={
                                                req.type === "XRAY" ? "primary" :
                                                    req.type === "BLOOD_TEST" ? "error" : "success"
                                            }
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{req.notes || "-"}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={req.status}
                                            color={req.status === "COMPLETED" ? "success" : "warning"}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {req.status === "PENDING" && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={() => setUploadDialog({ id: req._id, type: req.type })}
                                            >
                                                {t("lab.markCompleted", "Complete")}
                                            </Button>
                                        )}
                                        {req.status === "COMPLETED" && req.resultFileUrl && (
                                            <Button
                                                size="small"
                                                variant="text"
                                                href={`http://localhost:4000${req.resultFileUrl}`}
                                                target="_blank"
                                            >
                                                View Result
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {requests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        {t("lab.noRequests", "No lab requests found")}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </Paper>

            {uploadDialog && (
                <Dialog open={!!uploadDialog} onClose={() => setUploadDialog(null)} maxWidth="sm" fullWidth>
                    <DialogTitle>Upload Results</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <Typography variant="body2">
                                Upload results for <b>{uploadDialog.type}</b>
                            </Typography>

                            <Button
                                variant="outlined"
                                component="label"
                            >
                                Upload File
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                />
                            </Button>
                            {file && <Typography variant="caption">{file.name}</Typography>}

                            <TextField
                                label="Comments / Results"
                                multiline
                                rows={3}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                fullWidth
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setUploadDialog(null)}>Cancel</Button>
                        <Button
                            onClick={handleComplete}
                            variant="contained"
                            color="primary"
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Save & Complete"}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default LabDashboard;
