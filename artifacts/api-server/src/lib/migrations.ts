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

    // Series for article collections
    await client.query(`
      CREATE TABLE IF NOT EXISTS series (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS series_slug_idx ON series(slug);
    `);

    await client.query(`
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS series_id INTEGER REFERENCES series(id) ON DELETE SET NULL;
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS series_order INTEGER;
    `);

    // Comments (moderated)
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        author_name TEXT NOT NULL,
        author_email TEXT NOT NULL,
        content TEXT NOT NULL,
        approved BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS comments_article_id_idx ON comments(article_id);
      CREATE INDEX IF NOT EXISTS comments_approved_idx ON comments(approved);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        active BOOLEAN NOT NULL DEFAULT FALSE,
        member_since TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS members_email_idx ON members(lower(email));
    `);

    console.log("[migrations] Startup migrations complete");
  } catch (err) {
    console.error("[migrations] Migration error:", err);
  } finally {
    client.release();
  }
}
