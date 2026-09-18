export function SplashScreen() {
  return (
    <div className="h-screen w-full bg-background text-foreground flex items-center justify-center relative overflow-hidden font-sans antialiased select-none">
      {/* Background atmosphere */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {/* Center ambient glow */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "radial-gradient(circle 280px at 50% 50%, rgba(16, 185, 129, 0.045) 0%, rgba(18, 18, 18, 0) 100%)",
          }}
        />

        {/* Topographic contour lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-screen"
          preserveAspectRatio="none"
          viewBox="0 0 600 1200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M-100,200 C150,120 250,380 500,260 C700,160 800,420 900,320" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M-100,380 C120,300 280,560 520,440 C720,340 780,600 900,500" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M-100,560 C140,480 300,740 540,620 C740,520 800,780 900,680" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M-100,740 C160,660 320,920 560,800 C760,700 820,960 900,860" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M-100,920 C180,840 340,1100 580,980 C780,880 840,1140 900,1040" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center px-6">
        <div className="flex items-baseline tracking-[-0.04em]">
	       	<h1
	          className="text-[44px] sm:text-[50px] font-bold text-foreground tracking-[-0.035em] leading-none"
	          style={{ fontFamily: "'Inter', sans-serif" }}
	        >
	          twoside
	        </h1>
          <span
            aria-hidden="true"
            className="inline-block w-[11px] h-[11px] sm:w-[12px] sm:h-[12px] ml-[3px] rounded-full bg-primary transform translate-y-[-1.5px]"
            style={{ boxShadow: "0 0 14px 2px rgba(16, 185, 129, 0.45)" }}
          />
        </div>
      </main>

      <footer className="absolute bottom-0 inset-x-0 pb-12 px-6 z-10 text-center pointer-events-none">
        <p className="text-sm sm:text-base text-muted font-normal tracking-wider leading-relaxed max-w-xs sm:max-w-md mx-auto opacity-80">
          My answer to that timeless question,
          <br />
          "Where did all my money go?!"
        </p>
      </footer>
    </div>
  );
}