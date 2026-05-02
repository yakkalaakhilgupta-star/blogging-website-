import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";
import { runStartupMigrations } from "./lib/migrations";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

runStartupMigrations().catch((err) =>
  logger.error({ err }, "Startup migration error")
);

const server = app.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});

async function shutdown(signal: string) {
  logger.info({ signal }, "Shutdown signal received");
  server.close(async () => {
    logger.info("HTTP server closed");
    try {
      await pool.end();
      logger.info("DB pool closed");
    } catch (err) {
      logger.error({ err }, "Error closing DB pool");
    }
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
