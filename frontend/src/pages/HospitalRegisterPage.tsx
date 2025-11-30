import { useState } from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";

const HospitalRegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    licenseNumber: ""
  });
  const [message, setMessage] = useState<string | null>(null);

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
      setMessage("Registered successfully. Check your email.");
    } else {
      const err = await resp.json();
      setMessage(err.message || "Failed to register");
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={8}>
      <Paper sx={{ p: 4, width: 600 }}>
        <Typography variant="h5" mb={2}>Hospital Self-Registration</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth margin="normal" label="Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <TextField
            fullWidth margin="normal" label="Address"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          <TextField
            fullWidth margin="normal" label="Contact Email"
            value={form.contactEmail}
            onChange={(e) => handleChange("contactEmail", e.target.value)}
          />
          <TextField
            fullWidth margin="normal" label="Contact Phone"
            value={form.contactPhone}
            onChange={(e) => handleChange("contactPhone", e.target.value)}
          />
          <TextField
            fullWidth margin="normal" label="License Number"
            value={form.licenseNumber}
            onChange={(e) => handleChange("licenseNumber", e.target.value)}
          />
          {message && <Typography mt={1}>{message}</Typography>}
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Register
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default HospitalRegisterPage;
