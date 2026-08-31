class Logger {
  static log(...args: unknown[]) {
    if (import.meta.env.DEV) console.log(...args);
  }
  static error(...args: unknown[]) {
    if (import.meta.env.DEV) console.error(...args);
  }
}

export default Logger;