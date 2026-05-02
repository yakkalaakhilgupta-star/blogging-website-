import { pool } from "@workspace/db";

export async function runStartupMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE newsletter_subscribers
        ADD COLUMN IF NOT EXISTS confirmed BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS confirm_token TEXT;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS web_vitals (
        id SERIAL PRIMARY KEY,
        metric_name TEXT NOT NULL,
        value NUMERIC NOT NULL,
        rating TEXT,
        page TEXT,
        delta NUMERIC,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS web_vitals_metric_idx ON web_vitals(metric_name);
      CREATE INDEX IF NOT EXISTS web_vitals_created_at_idx ON web_vitals(created_at);
    `);

    console.log("[migrations] Startup migrations complete");
  } catch (err) {
    console.error("[migrations] Migration error:", err);
  } finally {
    client.release();
  }
}
