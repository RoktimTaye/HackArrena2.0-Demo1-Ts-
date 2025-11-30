import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Link,
  Grid,
  InputAdornment,
  Container
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";

const LoginPage = () => {
  const { login } = useAuth();
  const [tenantId, setTenantId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await login({ tenantId, username, password });
      const from = location.state?.from?.pathname || "/";
      navigate(from);
    } catch (err: any) {
      setMessage(err.message || "Login failed");
    }
  };

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: "linear-gradient(135deg, #00796b 0%, #004d40 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          p: 4
        }}
      >
        <LocalHospitalIcon sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          HMS Platform
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.8 }}>
          Advanced Hospital Management System
        </Typography>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "80%"
          }}
        >
          <Typography component="h1" variant="h4" fontWeight="bold" color="primary" mb={4}>
            {t("auth.loginTitle")}
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: "100%", maxWidth: 400 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={t("auth.tenantId")}
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t("auth.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t("auth.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            {message && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {message}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: "1rem" }}
            >
              {t("auth.loginButton")}
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link href="/hospital/register" variant="body2" underline="hover">
                  {t("auth.hospitalRegisterLink")}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LoginPage;
