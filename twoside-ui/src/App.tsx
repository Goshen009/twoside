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
import { OnboardPage } from "./pages/Onboarding/OnboardPage";

import { InfoProvider } from "@/hooks/useInfo";
import { TransactionsProvider } from "@/hooks/useTransactions";
import { LoansProvider } from "@/hooks/useLoans";
import { AddTransactionFlowProvider } from "@/hooks/useAddTransactionFlow";

import { AddTransactionFlow } from "@/components/transactions/AddTransactionFlow";

import { AppNavbar } from "@/components/layout/AppNavbar";
import { HomePage } from "@/pages/Home/HomePage";
import { LoansPage } from "@/pages/Loans/LoansPage";
import { useIsPWAMode } from "./hooks/useIsPWAMode";
import { LandingPage } from "./pages/Landing/LandingPage";

function RequirePWA({ children }: { children: ReactNode }) {
  const is_pwa_mode = useIsPWAMode();

	if (import.meta.env.DEV) return <>{children}</>;
	
  if (!is_pwa_mode) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const is_authenticated = useAuthStore((state) => state.is_authenticated);
  const requires_onboarding = useAuthStore((state) => state.requires_onboarding);
  
  if (is_authenticated && requires_onboarding) return <Navigate to="/onboarding" replace />;
  if (is_authenticated) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function OnboardingRoute({ children }: { children: ReactNode }) {
  const is_authenticated = useAuthStore((state) => state.is_authenticated);
  const requires_onboarding = useAuthStore((state) => state.requires_onboarding);

  if (!is_authenticated) return <Navigate to="/login" replace />;
  if (!requires_onboarding) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function ProtectedLayout() {
	const is_authenticated = useAuthStore((state) => state.is_authenticated);
  const requires_onboarding = useAuthStore((state) => state.requires_onboarding);
	
  if (!is_authenticated) return <Navigate to="/login" replace />;
  if (requires_onboarding) return <Navigate to="/onboarding" replace />;
  
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
      	<Route path="/" element={<LandingPage />} />
      
	      <Route
	        path="/login"
	        element={
						<RequirePWA>
		          <PublicOnlyRoute>
		            <AuthFlow mode="login" />
		          </PublicOnlyRoute>
						</RequirePWA>
	        }
	      />
	      <Route
	        path="/register"
	        element={
						<RequirePWA>
		          <PublicOnlyRoute>
		            <AuthFlow mode="register" />
		          </PublicOnlyRoute>
						</RequirePWA>
	        }
	      />
				<Route 
					path="/onboarding"
					element={
						<RequirePWA>
							<OnboardingRoute>
								<OnboardPage />
							</OnboardingRoute>
						</RequirePWA>
					}
				/>
				
        <Route element={<RequirePWA><ProtectedLayout/></RequirePWA>}>
          <Route path="/home" element={<HomePage />} />
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
