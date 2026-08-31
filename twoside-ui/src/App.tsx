import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { TransactionsCacheProvider } from "./hooks/providers/TransactionsCacheProvider";
import { AccountsProvider } from "./hooks/providers/AccountsProvider";
import { AuthProvider } from "./hooks/providers/AuthProvider";
import { useAuth } from "./hooks/useAuth";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { is_authenticated } = useAuth();
  if (is_authenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedLayout() {
  const { is_authenticated } = useAuth();
  if (!is_authenticated) return <Navigate to="/login" replace />;
  return (
    <AccountsProvider>
      <TransactionsCacheProvider>
        <Outlet />
      </TransactionsCacheProvider>
    </AccountsProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route element={<ProtectedLayout />}>
	         	<Route path="/" element={ <HomePage /> }/>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}