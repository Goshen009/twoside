import type { ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { InfoProvider } from "@/hooks/useInfo";
import { TransactionsProvider } from "@/hooks/useTransactions";
import { LoansProvider } from "@/hooks/useLoans";
import { AddTransactionFlowProvider } from "@/hooks/useAddTransactionFlow";
import { AddTransactionFlow } from "@/components/transactions/AddTransactionFlow";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { RegisterPage } from "@/pages/Register/RegisterPage";
import { LoginPage } from "@/pages/Login/LoginPage";
import { HomePage } from "@/pages/Home/HomePage";
import { LoansPage } from "@/pages/Loans/LoansPage";

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { is_authenticated } = useAuth();
  if (is_authenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedLayout() {
  const { is_authenticated } = useAuth();
  if (!is_authenticated) return <Navigate to="/login" replace />;
  return (
    <>
      <Outlet />
      <AppNavbar />
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/loans" element={<LoansPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InfoProvider>
          <TransactionsProvider>
            <LoansProvider>
              <AddTransactionFlowProvider>
                <AddTransactionFlow />
                <AnimatedRoutes />
              </AddTransactionFlowProvider>
            </LoansProvider>
          </TransactionsProvider>
        </InfoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
