import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { APIClient } from "@/api/client";
import { AuthAPI } from "@/api/AuthApi";
import type { AuthContextValue } from "@/types/types";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [is_authenticated, setIsAuthenticated] = useState(false);
  const [checking_session, setCheckingSession] = useState(true);

  useEffect(() => {
    APIClient.refresh().then((success) => {
      setIsAuthenticated(success);
      setCheckingSession(false);
    });
  }, []);

  useEffect(() => {
    APIClient.onUnauthorized = () => setIsAuthenticated(false);
    return () => {
      APIClient.onUnauthorized = null;
    };
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    await AuthAPI.login(username, password);
    setIsAuthenticated(true);
  };

  const register = async (username: string, password: string): Promise<void> => {
    await AuthAPI.register(username, password);
    setIsAuthenticated(true);
  };

  const logout = async (): Promise<void> => {
    await AuthAPI.logout();
    setIsAuthenticated(false);
  };

  if (checking_session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ is_authenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
