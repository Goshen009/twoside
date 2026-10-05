import { motion } from "framer-motion";
// import { AlertTriangle } from "lucide-react";

interface FullScreenErrorProps {
  onRetry: () => void;
}

export function FullScreenError({ onRetry }: FullScreenErrorProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex items-center justify-center relative font-sans antialiased select-none">
      {/* Background atmosphere — same structure as SplashScreen, red-tinted */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "radial-gradient(circle 280px at 50% 40%, rgba(239, 68, 68, 0.06) 0%, rgba(18, 18, 18, 0) 100%)",
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-screen"
          preserveAspectRatio="none"
          viewBox="0 0 600 1200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M-100,200 C150,120 250,380 500,260 C700,160 800,420 900,320" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M-100,380 C120,300 280,560 520,440 C720,340 780,600 900,500" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M-100,560 C140,480 300,740 540,620 C740,520 800,780 900,680" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-xs">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-14 h-14 rounded-full flex items-center justify-center mb-3 ring-4 ring-background"
          style={{
            backgroundColor: "#EF4444",
            boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.3)",
          }}
        >
          {/*<AlertTriangle className="w-6 h-6 text-background" strokeWidth={2} />*/}
        </motion.div>

        <h1 className="text-lg font-bold text-foreground tracking-tight mb-12">
          Well, that's embarrassing. Something broke on my end — try again?
        </h1>

        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-2.5 rounded-full bg-primary text-background text-sm font-semibold hover:bg-primary-hover active:scale-95 transition-all"
        >
          Try again
        </button>
      </main>
    </div>
  );
}