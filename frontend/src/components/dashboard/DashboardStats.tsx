import { Card, CardContent, Grid, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EventIcon from "@mui/icons-material/Event";
import ScienceIcon from "@mui/icons-material/Science";

interface DashboardStatsProps {
    stats: any;
    role: string[];
}

export const DashboardStats = ({ stats, role }: DashboardStatsProps) => {
    const { t } = useTranslation();

    const isDoctor = role.includes("DOCTOR");

    return (
        <Grid container spacing={3} mb={4}>
            {isDoctor ? (
                <>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            title={t("dashboard.assignedPatients", "Assigned Patients")}
                            value={stats.assignedPatients || 0}
                            icon={<PeopleIcon fontSize="large" color="primary" />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            title={t("dashboard.appointmentsToday", "Appointments Today")}
                            value={stats.appointmentsToday || 0}
                            icon={<EventIcon fontSize="large" color="secondary" />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            title={t("dashboard.pendingLabs", "Pending Lab Requests")}
                            value={stats.pendingLabRequests || 0}
                            icon={<ScienceIcon fontSize="large" color="error" />}
                        />
                    </Grid>
                </>
            ) : (
                <>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            title={t("dashboard.totalPatients", "Total Patients")}
                            value={stats.totalPatients || 0}
                            icon={<PeopleIcon fontSize="large" color="primary" />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            title={t("dashboard.newPatients", "New Patients (Today)")}
                            value={stats.newPatientsToday || 0}
                            icon={<PersonAddIcon fontSize="large" color="success" />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            title={t("dashboard.appointmentsToday", "Appointments Today")}
                            value={stats.appointmentsToday || 0}
                            icon={<EventIcon fontSize="large" color="secondary" />}
                        />
                    </Grid>
                </>
            )}
        </Grid>
    );
};

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
    <Card sx={{ height: "100%" }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div" fontWeight="bold">
                        {value}
                    </Typography>
                </Box>
                <Box p={1} bgcolor="action.hover" borderRadius="50%">
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);
