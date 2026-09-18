import { motion } from "framer-motion";

export function ShrinkTest() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "green",
          x: "-50%",
          y: "-100%",
          transformOrigin: "50% 100%",
        }}
        initial={{ scale: 20 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
    </div>
  );
}