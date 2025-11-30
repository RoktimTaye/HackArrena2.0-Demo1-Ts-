import { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Grid, Container, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const HospitalRegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    licenseNumber: "",
    adminUsername: "",
    adminPassword: ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const { t } = useTranslation();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const resp = await fetch("http://localhost:4000/api/tenants/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (resp.ok) {
      const data = await resp.json();
      setMessage(null);
      setSuccessData(data);
    } else {
      const err = await resp.json();
      setMessage(err.message || t("onboarding.registerFailed"));
    }
  };

  if (successData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Paper sx={{ p: 5, width: 600, textAlign: 'center' }}>
          <LocalHospitalIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" mb={2} color="primary" fontWeight="bold">Registration Successful!</Typography>
          <Typography paragraph color="textSecondary">
            Your hospital has been successfully registered. Please save these credentials securely.
          </Typography>

          <Box bgcolor="#e0f2f1" p={3} borderRadius={2} mb={4} textAlign="left">
            <Grid container spacing={2}>
              <Grid item xs={4}><Typography fontWeight="bold">Tenant ID:</Typography></Grid>
              <Grid item xs={8}><Typography sx={{ wordBreak: 'break-all' }}>{successData.tenantId}</Typography></Grid>

              <Grid item xs={4}><Typography fontWeight="bold">Username:</Typography></Grid>
              <Grid item xs={8}><Typography>{successData.adminCredentials?.username}</Typography></Grid>

              <Grid item xs={4}><Typography fontWeight="bold">Password:</Typography></Grid>
              <Grid item xs={8}><Typography>{successData.adminCredentials?.password}</Typography></Grid>
            </Grid>
          </Box>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => window.location.href = "/login"}
          >
            Proceed to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      bgcolor="background.default"
    >
      <Box bgcolor="primary.main" py={3} color="white" textAlign="center">
        <Container>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
            <LocalHospitalIcon fontSize="large" />
            <Typography variant="h5" fontWeight="bold">HMS Platform</Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ mt: -4, mb: 8, flex: 1, display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ p: 5, width: '100%' }}>
          <Typography variant="h4" mb={1} fontWeight="bold" textAlign="center">
            {t("onboarding.hospitalRegisterTitle")}
          </Typography>
          <Typography variant="body1" color="textSecondary" mb={4} textAlign="center">
            Register your medical institution to get started
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("onboarding.name")}
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("onboarding.address")}
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("onboarding.contactEmail")}
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("onboarding.contactPhone")}
                  value={form.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("onboarding.licenseNumber")}
                  value={form.licenseNumber}
                  onChange={(e) => handleChange("licenseNumber", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Admin Username"
                  value={form.adminUsername}
                  onChange={(e) => handleChange("adminUsername", e.target.value)}
                  required
                  helperText="Create a username for the admin account"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Admin Password"
                  type="password"
                  value={form.adminPassword}
                  onChange={(e) => handleChange("adminPassword", e.target.value)}
                  required
                  helperText="Create a strong password"
                />
              </Grid>
            </Grid>

            {message && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {message}
              </Alert>
            )}

            <Box mt={4} display="flex" gap={2}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => window.location.href = "/login"}
              >
                {t("auth.backToLogin") || "Cancel"}
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
              >
                {t("onboarding.registerButton")}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default HospitalRegisterPage;
