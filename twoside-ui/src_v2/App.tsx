import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/providers/AuthProvider";
import { useAuth } from "./hooks/useAuth";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (useAuth().is_authenticated) 
  	return <Navigate to="/login" replace />;
  
  return (
  	<>{children}</>
  );
  // return <AccountsProvider>{children}</AccountsProvider>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  if (useAuth().is_authenticated)
  	return <Navigate to="/" replace />;
  
  return (
  	<>{children}</>
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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}