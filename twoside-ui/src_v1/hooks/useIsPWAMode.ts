import { useState, useEffect } from "react";

function checkPWAMode(): boolean {
  const display_mode_standalone = window.matchMedia("(display-mode: standalone)").matches;
  const ios_standalone = (window.navigator as { standalone?: boolean }).standalone === true;
  return display_mode_standalone || ios_standalone;
}

export function useIsPWAMode(): boolean {
  const [is_pwa_mode, setIsPWA] = useState(checkPWAMode);

  useEffect(() => {
    const mql = window.matchMedia("(display-mode: standalone)");
    const handler = () => setIsPWA(checkPWAMode());
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return is_pwa_mode;
}