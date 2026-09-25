interface TopographicHeaderProps {
  height?: number;
}

export function TopographicHeader({ height = 320 }: TopographicHeaderProps) {
  return (
    <header
      className="relative w-full overflow-hidden select-none bg-background flex flex-col justify-end"
      style={{ height }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute top-10 -left-10 w-64 h-64 rounded-full bg-surface/80 blur-2xl pointer-events-none" />

        {/* Contour lines */}
        <svg
          className="w-full h-full object-cover opacity-60"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 430 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M-20 40 C60 20, 130 90, 220 50 C310 10, 370 70, 450 30" fill="none" opacity="0.6" stroke="#1f1f23" strokeWidth="1.5" />
          <path d="M-30 80 C80 50, 140 130, 240 80 C340 30, 390 110, 460 70" fill="none" stroke="#9CA3AF" strokeOpacity="0.15" strokeWidth="1" />
          <path d="M-10 110 C70 90, 160 160, 260 110 C360 60, 400 140, 460 100" fill="none" stroke="#22c55e" strokeOpacity="0.25" strokeWidth="1.2" />
          <path d="M-40 150 C90 120, 170 200, 280 140 C380 90, 410 170, 470 130" fill="none" stroke="#9CA3AF" strokeOpacity="0.18" strokeWidth="1" />
          <path d="M-20 180 C80 160, 190 230, 290 170 C390 120, 420 200, 470 160" fill="none" opacity="0.8" stroke="#1f1f23" strokeWidth="2" />
          <path d="M-30 220 C100 190, 210 260, 310 200 C410 150, 430 230, 480 190" fill="none" stroke="#22c55e" strokeOpacity="0.2" strokeWidth="1" />

          <path d="M 180 90 C 230 60, 280 90, 270 130 C 260 170, 190 180, 160 150 C 130 120, 150 100, 180 90 Z" fill="none" stroke="#9CA3AF" strokeOpacity="0.2" strokeWidth="1" />
          <path d="M 190 105 C 220 85, 255 105, 250 130 C 240 155, 195 160, 175 142 C 155 125, 170 112, 190 105 Z" fill="#22c55e" fillOpacity="0.03" stroke="#22c55e" strokeOpacity="0.3" strokeWidth="1.2" />
          <path d="M 205 118 C 220 105, 238 115, 235 128 C 230 140, 205 145, 195 135 C 188 127, 195 122, 205 118 Z" fill="none" stroke="#9CA3AF" strokeOpacity="0.25" strokeWidth="1" />

          <path d="M 320 40 C 370 20, 420 40, 415 80 C 410 120, 360 120, 330 95 C 305 75, 300 50, 320 40 Z" fill="none" stroke="#9CA3AF" strokeOpacity="0.15" strokeWidth="1" />
          <path d="M 335 52 C 370 38, 402 52, 398 80 C 392 105, 360 105, 342 88 C 328 72, 320 60, 335 52 Z" fill="none" stroke="#22c55e" strokeOpacity="0.25" strokeWidth="1" />

          <path d="M -10 90 C 40 80, 80 120, 70 160 C 60 190, 10 210, -20 190 Z" fill="none" stroke="#9CA3AF" strokeOpacity="0.15" strokeWidth="1" />
        </svg>
      </div>

      {/* Wave divider */}
      <div className="relative w-full z-10">
        <svg
          className="w-full block h-20 -mb-1 text-background fill-current"
          preserveAspectRatio="none"
          viewBox="0 0 430 80"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 45 C120 75, 190 5, 310 18 C365 24, 400 38, 430 46 L430 80 L0 80 Z" />
        </svg>
      </div>
    </header>
  );
}