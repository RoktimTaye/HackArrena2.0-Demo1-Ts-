import { useEffect, useState } from "react";
import { Typography, Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../api/client";
import { DashboardStats } from "../../components/dashboard/DashboardStats";
import { DoctorCalendar } from "../../components/dashboard/DoctorCalendar";

const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const statsData = await apiFetch("/dashboard/stats");
        setStats(statsData);

        if (user?.roles.includes("DOCTOR")) {
          const appointmentsData = await apiFetch(`/appointments?doctorId=${user.id}`);
          setAppointments(appointmentsData);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" mb={1}>{t("dashboard.title")}</Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>
        {t("dashboard.welcome", { tenantId: user?.tenantId })}
      </Typography>

      {stats && <DashboardStats stats={stats} role={user?.roles || []} />}

      {user?.roles.includes("DOCTOR") && (
        <Box mt={4}>
          <Typography variant="h6" mb={2}>{t("dashboard.calendar", "Appointment Calendar")}</Typography>
          <DoctorCalendar appointments={appointments} />
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
