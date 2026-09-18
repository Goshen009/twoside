import { useEffect, type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";

import { AuthFlow } from "./pages/Auth/AuthFlow";
import { SplashScreen } from "./pages/Splash/SplashScreen";

// import { AuthProvider, useAuth } from "@/hooks/useAuth";
// import { InfoProvider } from "@/hooks/useInfo";
// import { TransactionsProvider } from "@/hooks/useTransactions";
// import { LoansProvider } from "@/hooks/useLoans";
// import { AddTransactionFlowProvider } from "@/hooks/useAddTransactionFlow";

// import { AddTransactionFlow } from "@/components/transactions/AddTransactionFlow";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { HomePage } from "@/pages/Home/HomePage";
import { LoansPage } from "@/pages/Loans/LoansPage";

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const is_authenticated = useAuthStore((state) => state.is_authenticated);
  
  if (is_authenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedLayout() {
  const is_authenticated = useAuthStore((state) => state.is_authenticated);
  
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
          path="/login"
          element={
            <PublicOnlyRoute>
              <AuthFlow />
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
	const checking_session = useAuthStore((state) => state.checking_session);
  const initialize = useAuthStore((state) => state.initialize);
	
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
  	<>
   		<AnimatePresence>
     		{checking_session && (
     			<motion.div
            key="splash"
            exit={{ opacity: 0 }}
            	transition={{ duration: 0.4 }}
              className="fixed inset-0 z-50"
            >
              <SplashScreen />
          </motion.div>
       	)}
     	</AnimatePresence>

      {!checking_session && (
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      )}
   	</>
  );
  
  // return (
  //   <BrowserRouter>
  //     <AuthProvider>
  //       <InfoProvider>
  //         <TransactionsProvider>
  //           <LoansProvider>
  //             <AddTransactionFlowProvider>
          
  //               <AddTransactionFlow />
  //               <AnimatedRoutes />
  //             </AddTransactionFlowProvider>
  //           </LoansProvider>
  //         </TransactionsProvider>
  //       </InfoProvider>
  //     </AuthProvider>
  //   </BrowserRouter>
  // );
}
