import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import HospitalRegisterPage from "./pages/onboarding/HospitalRegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import PatientListPage from "./pages/patients/PatientListPage";
import PatientCreatePage from "./pages/patients/PatientCreatePage";
import PrescriptionCreatePage from "./pages/prescriptions/PrescriptionCreatePage";
import UserListPage from "./pages/users/UserListPage";
import LabDashboard from "./pages/lab/LabDashboard";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { ProtectedLayout } from "./components/layout/ProtectedLayout";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/hospital/register" element={<HospitalRegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="patients" element={<PatientListPage />} />
          <Route path="patients/opd" element={<PatientListPage defaultType="OPD" />} />
          <Route path="patients/ipd" element={<PatientListPage defaultType="IPD" />} />
          <Route path="patients/new" element={<PatientCreatePage />} />
          <Route path="prescriptions/new" element={<PrescriptionCreatePage />} />
          <Route path="users" element={<UserListPage />} />
          <Route path="lab" element={<LabDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

// }



export default App;
