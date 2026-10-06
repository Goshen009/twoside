import { useEffect } from "react";
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import { useAuthStore } from "./stores/useAuthStore";

export function App() {
  const checking_session = useAuthStore((s) => s.checking_session);
  const is_authenticated = useAuthStore((s) => s.is_authenticated);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (checking_session) return null; // swap in a splash screen whenever you like
  if (!is_authenticated) return <LoginPage />;
  return <HomePage />;
}