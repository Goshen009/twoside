import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell } from "@/pages/Auth/AuthShell";
import { EmailForm } from "@/pages/Auth/EmailForm";
import { OtpForm } from "@/pages/Auth/OtpForm";

type Step = "login" | "otp";
type Direction = "forward" | "backward";

export type Mode = "login" | "register";
interface AuthFlowProps {
  mode: Mode;
}

const headlines: Record<Mode, Record<Step, string>> = {
  login: {
    login: "Welcome back",
    otp: "I've emailed you a code",
  },
  register: {
    login: "Ready to know where all your money went?",
    otp: "I've emailed you a code",
  },
};

const slideVariants = {
  enter: (direction: Direction) => ({
    x: direction === "forward" ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: Direction) => ({
    x: direction === "forward" ? -40 : 40,
    opacity: 0,
  }),
};

export function AuthFlow({ mode }: AuthFlowProps) {
  const [step, setStep] = useState<Step>("login");
  const [direction, setDirection] = useState<Direction>("forward");
  const [error_message, setErrorMessage] = useState<string | null>(null);

  const goTo = (nextStep: Step, dir: Direction) => {
  	setErrorMessage(null);
    setDirection(dir);
    setStep(nextStep);
  }

  const goToWithError = (nextStep: Step, dir: Direction, message: string) => {
    setErrorMessage(message);
    setDirection(dir);
    setStep(nextStep);
  }

  return (
    <AuthShell 
    	headline={headlines[mode][step]}
    	is_error={!!error_message}
      error_message={error_message ?? undefined}
      onDismissError={() => setErrorMessage(null)}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full flex flex-col items-center"
        >
          {step === "login" && (
          	<EmailForm
           		mode={mode}
              onComplete={() => goTo("otp", "forward")}
              onError={setErrorMessage}
              onClearError={() => setErrorMessage(null)}
            />
          )}
          {step === "otp" && (
            <OtpForm
            	mode={mode}
              onBack={() => goTo("login", "backward")}
              onError={setErrorMessage}
              onExpired={(message) => goToWithError("login", "backward", message)}
              onClearError={() => setErrorMessage(null)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  );
}