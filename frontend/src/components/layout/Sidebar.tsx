import { Box, List, ListItemButton, ListItemText, Collapse } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { menuConfig, MenuItemConfig } from "./menuConfig";
import { useTranslation } from "react-i18next";

export const Sidebar = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState<string | null>(null);
  const { t } = useTranslation();

  if (!user) return null;

  const canSee = (item: MenuItemConfig) => {
    const visible = !item.permission || hasPermission(item.permission);
    if (item.labelKey === "patients.registerPatientMenu") {
      console.log(`Checking permission for ${item.labelKey}:`, {
        required: item.permission,
        userPermissions: user.permissions,
        hasPermission: visible
      });
    }
    return visible;
  };

  const handleClick = (item: MenuItemConfig) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setOpen((prev) => (prev === item.labelKey ? null : item.labelKey));
    }
  };

  const isActive = (path?: string) =>
    path && location.pathname === path;

  return (
    <Box width={240} bgcolor="#1f2933" color="#fff" p={1}>
      <List>
        {menuConfig
          .filter(canSee)
          .map((item) => (
            <Box key={item.labelKey}>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => handleClick(item)}
              >
                <ListItemText primary={t(item.labelKey)} />
              </ListItemButton>
              {item.children && (
                <Collapse in={open === item.labelKey} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.filter(canSee).map((child) => {
                      if (child.labelKey === "patients.registerPatientMenu") {
                        console.log("RENDERING registerPatientMenu! This should not happen if permission is false.");
                      }
                      return (
                        <ListItemButton
                          key={child.labelKey}
                          sx={{ pl: 4 }}
                          selected={isActive(child.path)}
                          onClick={() => handleClick(child)}
                        >
                          <ListItemText primary={t(child.labelKey)} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
      </List>
    </Box>
  );
};
