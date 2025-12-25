export function log(msg: string, type: "info" | "success" | "warn" | "error" = "info") {
  const c = {
    info: "\x1b[36m%s\x1b[0m",
    success: "\x1b[32m%s\x1b[0m",
    warn: "\x1b[33m%s\x1b[0m",
    error: "\x1b[31m%s\x1b[0m"
  };
  console.log(c[type], msg);
}
