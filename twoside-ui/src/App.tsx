import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/Home/HomePage";
import InsightsPage from "@/pages/Insights/InsightsPage";
import LoginPage from "@/pages/Auth/LoginPage";
import { AppNavbar } from "@/components/AppNavbar";
import { useAuthStore } from "@/stores/useAuthStore";

function ProtectedLayout() {
  return (
    <>
      <Outlet />
      <AppNavbar />
    </>
  );
}

export function App() {
  const checking_session = useAuthStore((s) => s.checking_session);
  const is_authenticated = useAuthStore((s) => s.is_authenticated);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (checking_session) return null; // swap in a splash screen whenever you like
  if (!is_authenticated) return <LoginPage />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}