import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell } from "@/pages/Auth/AuthShell";
import { EmailForm } from "@/pages/Auth/EmailForm";
import { OtpForm } from "@/pages/Auth/OtpForm";
import { OnboardForm } from "@/pages/Auth/OnboardForm";

type Step = "login" | "otp" | "onboard";
type Direction = "forward" | "backward";

const headlines: Record<Step, string> = {
  login: "Ready to know where all your money went?",
  otp: "I've emailed you a code",
  onboard: "Getting you ready...",
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

export function AuthFlow() {
  const [step, setStep] = useState<Step>("login");
  const [direction, setDirection] = useState<Direction>("forward");

  function goTo(nextStep: Step, dir: Direction) {
    setDirection(dir);
    setStep(nextStep);
  }

  return (
    <AuthShell headline={headlines[step]}>
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
            <EmailForm onComplete={() => goTo("otp", "forward")} />
          )}
          {step === "otp" && (
            <OtpForm
              onComplete={() => goTo("onboard", "forward")}
              onBack={() => goTo("login", "backward")}
            />
          )}
          {step === "onboard" && (
            <OnboardForm onComplete={() => console.log("onboarding done")} />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  );
}