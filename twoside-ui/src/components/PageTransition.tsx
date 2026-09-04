import { motion, useReducedMotion } from "framer-motion";
import type { PageTransitionProps } from "@/types/types";

export function PageTransition({ children }: PageTransitionProps) {
  const reduce_motion = useReducedMotion() ?? false;

  return (
    <motion.div
      initial={reduce_motion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      animate={reduce_motion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      exit={reduce_motion ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
