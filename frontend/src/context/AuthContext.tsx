import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  attributes?: {
    department?: string;
  };
  tokenVersion?: number;
}

interface UserInfo {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  attributes?: {
    department?: string;
  };
}

interface AuthContextType {
  user: UserInfo | null;
  accessToken: string | null;
  login: (payload: {
    tenantId: string;
    username: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("hms_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAccessToken(parsed.accessToken);
        setUser(parsed.user);
      } catch (err) {
        console.error("Failed to parse stored auth:", err);
        localStorage.removeItem("hms_auth");
      }
    }
  }, []);

  const login = async ({ tenantId, username, password }: any) => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const resp = await fetch(`${baseUrl}/api/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "password",
        tenantId,
        username,
        password
      })
    });
    if (!resp.ok) throw new Error("Login failed");
    const data = await resp.json();

    const decoded = jwtDecode<JwtPayload>(data.access_token);
    const userInfo: UserInfo = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
      attributes: decoded.attributes
    };

    setAccessToken(data.access_token);
    setUser(userInfo);
    localStorage.setItem(
      "hms_auth",
      JSON.stringify({ accessToken: data.access_token, user: userInfo })
    );
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("hms_auth");
  };

  const hasPermission = (perm: string) => {
    if (!user) return false;
    if (user.permissions.includes("*")) return true;
    return user.permissions.includes(perm);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
