import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { AmbientToken } from "@/types/types";

const tokens: AmbientToken[] = [
  { symbol: "💸", top: "15%", left: "12%", duration: 7, delay: 0 },
  { symbol: "🤝", top: "22%", right: "14%", duration: 8, delay: 1 },
  { symbol: "+ $", top: "75%", left: "16%", duration: 6, delay: 2 },
  { symbol: "- ₦", top: "68%", right: "15%", duration: 9, delay: 0.5 },
  { symbol: "⇌", top: "45%", left: "8%", duration: 7.5, delay: 3 },
  { symbol: "✦", top: "48%", right: "9%", duration: 8.5, delay: 1.5 },
];

function CursorSpotlight() {
  const [cursor, setCursor] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      setCursor({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div
      className="absolute w-[560px] h-[560px] rounded-full opacity-25 blur-3xl transition-transform duration-300 ease-out"
      style={{
        background:
          "radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0) 70%)",
        transform: `translate(${cursor.x - 280}px, ${cursor.y - 280}px)`,
      }}
    />
  );
}

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dynamic Cursor Spotlight */}
      <CursorSpotlight />

      {/* Top Center Ambient Bloom */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-primary/[0.16] rounded-full blur-[90px] pointer-events-none" />

      {/* Bottom Subtle Secondary Bloom */}
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-950/50 rounded-full blur-[90px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 twoside-grid opacity-60" />

      {/* Floating Two-Side Finance Tokens */}
      <div className="absolute inset-0">
        {tokens.map((token) => (
          <motion.div
            key={token.symbol}
            className="absolute hidden md:flex items-center justify-center w-8 h-8 rounded-xl bg-[#0c0c0e]/60 border border-[#1f1f23] text-xs font-mono text-zinc-500 backdrop-blur-sm select-none shadow-sm"
            style={{
              top: token.top,
              left: token.left,
              right: token.right,
            }}
            animate={{
              y: [0, -12, 0],
              rotate: [0, 4, -4, 0],
              opacity: [0.35, 0.7, 0.35],
            }}
            transition={{
              duration: token.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: token.delay,
            }}
          >
            {token.symbol}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
