const DONE_KEY = "install_hint_done";

export class PWA {
  // Already running as an installed app, so no need to nag.
  static isStandalone(): boolean {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    );
  }

  static isIOS(): boolean {
    return (
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }

  static isDone(): boolean {
    try {
      return localStorage.getItem(DONE_KEY) === "1";
    } catch {
      return false;
    }
  }

 static  markDone(): void {
    try {
      localStorage.setItem(DONE_KEY, "1");
    } catch {
      /* private mode etc: it'll just show again */
    }
  }
}