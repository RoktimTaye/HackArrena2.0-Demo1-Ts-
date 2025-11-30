import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography
} from "@mui/material";

const LoginPage = () => {
  const [tenantId, setTenantId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const resp = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, username, password })
    });
    if (resp.ok) {
      const data = await resp.json();
      localStorage.setItem("hms-token", data.accessToken);
      setMessage("Login successful");
    } else {
      const err = await resp.json();
      setMessage(err.message || "Login failed");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" mb={2}>HMS Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth margin="normal" label="Tenant ID"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
          />
          <TextField
            fullWidth margin="normal" label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth margin="normal" label="Password" type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {message && <Typography mt={1}>{message}</Typography>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
