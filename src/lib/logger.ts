type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const log = (level: LogLevel, message: string, context?: LogContext) => {
  const payload = {
    level,
    message,
    ...(context ?? {}),
    timestamp: new Date().toISOString()
  };
  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
};

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context)
};
