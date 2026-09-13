import { spawn } from "node:child_process";
import { validateRuntime, ConfigurationError } from "../src/lib/config.ts";
import { log } from "../src/lib/logger.ts";
Object.assign(process.env, { NODE_ENV: process.env.NODE_ENV || "production" });
try {
  validateRuntime();
} catch (error) {
  log("configuration_invalid");
  if (error instanceof ConfigurationError)
    console.error("Configure these variable names: " + error.fields.join(", "));
  process.exit(1);
}
// Keep retries alive without a public worker endpoint or an extra Railway service.
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "0.0.0.0",
    "--port",
    process.env.PORT || "3000",
  ],
  { stdio: "inherit" },
);
const worker = spawn(
  process.execPath,
  ["--experimental-strip-types", "scripts/notifications.ts", "--loop"],
  { stdio: "inherit" },
);
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  server.kill("SIGTERM");
  worker.kill("SIGTERM");
  setTimeout(() => process.exit(process.exitCode || 0), 8000).unref();
}
for (const child of [server, worker]) {
  child.on("error", () => {
    process.exitCode = 1;
    stop();
  });
  child.on("exit", (code) => {
    if (!stopping) {
      process.exitCode = code || 1;
      stop();
    }
  });
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
