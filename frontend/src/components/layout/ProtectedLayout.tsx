import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const ProtectedLayout = () => {
  return (
    <Box display="flex" height="100vh">
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Topbar />
        <Box flex={1} p={2} bgcolor="#f5f5f5">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
