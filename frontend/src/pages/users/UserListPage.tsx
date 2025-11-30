import { useState, useEffect } from "react";
import { apiFetch } from "../../api/client";
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    SelectChangeEvent
} from "@mui/material";
import { useTranslation } from "react-i18next";

const AVAILABLE_ROLES = [
    { value: "DOCTOR", label: "Doctor" },
    { value: "NURSE", label: "Nurse" },
    { value: "PHARMACIST", label: "Pharmacist" },
    { value: "RECEPTIONIST", label: "Receptionist (Front Desk)" },
    { value: "LAB_TECHNICIAN", label: "Lab Technician" }
];

const UserListPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [createDialog, setCreateDialog] = useState(false);
    const [successDialog, setSuccessDialog] = useState<any>(null);
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        roles: [] as string[]
    });
    const { t } = useTranslation();

    const load = async () => {
        const data = await apiFetch("/users");
        setUsers(data);
    };

    useEffect(() => {
        load();
    }, []);

    const handleCreate = async () => {
        const result = await apiFetch("/users", {
            method: "POST",
            body: JSON.stringify(form)
        });
        setCreateDialog(false);
        setSuccessDialog(result);
        setForm({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            department: "",
            roles: []
        });
        load();
    };

    const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
        setForm({ ...form, roles: event.target.value as string[] });
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{t("users.title") || "User Management"}</Typography>
                <Button variant="contained" onClick={() => setCreateDialog(true)}>
                    Create User
                </Button>
            </Box>

            <Paper>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Roles</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>
                                    {user.roles?.map((role: string) => (
                                        <Chip key={role} label={role} size="small" sx={{ mr: 0.5 }} />
                                    ))}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.status}
                                        size="small"
                                        color={user.status === "ACTIVE" ? "success" : "default"}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New User</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="First Name"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Last Name"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Department"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Roles</InputLabel>
                        <Select
                            multiple
                            value={form.roles}
                            onChange={handleRoleChange}
                            input={<OutlinedInput label="Roles" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} size="small" />
                                    ))}
                                </Box>
                            )}
                        >
                            {AVAILABLE_ROLES.map((role) => (
                                <MenuItem key={role.value} value={role.value}>
                                    {role.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!successDialog} onClose={() => setSuccessDialog(null)}>
                <DialogTitle>User Created Successfully</DialogTitle>
                <DialogContent>
                    <Typography paragraph>Please save these credentials:</Typography>
                    <Box bgcolor="#f5f5f5" p={2} borderRadius={1}>
                        <Typography>
                            <strong>Username:</strong> {successDialog?.username}
                        </Typography>
                        <Typography>
                            <strong>Email:</strong> {successDialog?.email}
                        </Typography>
                        <Typography>
                            <strong>Temporary Password:</strong> Temp@1234
                        </Typography>
                    </Box>
                    <Typography variant="caption" mt={2} display="block">
                        User will be prompted to change password on first login.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSuccessDialog(null)} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserListPage;
