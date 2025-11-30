import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#00796b", // Teal 700
            light: "#48a999",
            dark: "#004c40",
            contrastText: "#ffffff"
        },
        secondary: {
            main: "#1976d2", // Blue 700
            light: "#63a4ff",
            dark: "#004ba0",
            contrastText: "#ffffff"
        },
        background: {
            default: "#f4f6f8",
            paper: "#ffffff"
        },
        text: {
            primary: "#1c2434",
            secondary: "#64748b"
        }
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: "none", fontWeight: 600 }
    },
    shape: {
        borderRadius: 8
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: "8px 24px",
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }
                },
                containedPrimary: {
                    background: "linear-gradient(45deg, #00796b 30%, #26a69a 90%)"
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 8
                    }
                }
            }
        }
    }
});
