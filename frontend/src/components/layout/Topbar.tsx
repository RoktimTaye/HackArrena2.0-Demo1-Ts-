import { AppBar, Box, Button, FormControl, InputLabel, MenuItem, Select, Toolbar, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const languageOptions = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "ml", label: "മലയാളം" }
];

export const Topbar = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("hms_lang", code);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          HMS
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>{t("layout.changeLanguage")}</InputLabel>
            <Select
              label={t("layout.changeLanguage")}
              value={currentLang}
              onChange={(e) => changeLanguage(e.target.value as string)}
            >
              {languageOptions.map((opt) => (
                <MenuItem key={opt.code} value={opt.code}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {user && (
            <>
              <Box textAlign="right">
                <Typography variant="body2" fontWeight="bold">
                  {user.roles.join(", ")}
                </Typography>
                <Typography variant="caption" display="block">
                  {user.tenantId}
                </Typography>
              </Box>
              <Button onClick={logout}>Logout</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
