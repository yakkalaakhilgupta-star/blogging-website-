import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

// GET /api/series — list all series
router.get("/series", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, COUNT(a.id)::int AS article_count
       FROM series s
       LEFT JOIN articles a ON a.series_id = s.id AND a.status = 'published'
       GROUP BY s.id
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch series" });
  }
});

// GET /api/series/:slug — single series with its articles
router.get("/series/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const seriesRes = await pool.query(
      "SELECT * FROM series WHERE slug = $1",
      [slug]
    );
    if (!seriesRes.rows[0]) {
      res.status(404).json({ error: "Series not found" });
      return;
    }
    const series = seriesRes.rows[0];
    const articlesRes = await pool.query(
      `SELECT id, title, slug, excerpt, image_url AS "imageUrl", read_time AS "readTime",
              published_at AS "publishedAt", series_order AS "seriesOrder", category
       FROM articles
       WHERE series_id = $1 AND status = 'published'
       ORDER BY series_order ASC NULLS LAST, published_at ASC`,
      [series.id]
    );
    res.json({ ...series, articles: articlesRes.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch series" });
  }
});

// Admin: POST /api/series
router.post("/series", requireAdmin, async (req, res) => {
  const { title, slug, description, imageUrl } = req.body;
  if (!title || !slug) {
    res.status(400).json({ error: "title and slug required" });
    return;
  }
  try {
    const result = await pool.query(
      "INSERT INTO series (title, slug, description, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, slug, description ?? null, imageUrl ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Slug already exists" });
    } else {
      res.status(500).json({ error: "Failed to create series" });
    }
  }
});

// Admin: PUT /api/series/:id
router.put("/series/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { title, slug, description, imageUrl } = req.body;
  try {
    const result = await pool.query(
      `UPDATE series SET title = COALESCE($1, title), slug = COALESCE($2, slug),
       description = COALESCE($3, description), image_url = COALESCE($4, image_url)
       WHERE id = $5 RETURNING *`,
      [title ?? null, slug ?? null, description ?? null, imageUrl ?? null, id]
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: "Series not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update series" });
  }
});

// Admin: DELETE /api/series/:id
router.delete("/series/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await pool.query("UPDATE articles SET series_id = NULL, series_order = NULL WHERE series_id = $1", [id]);
    await pool.query("DELETE FROM series WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete series" });
  }
});

// Admin: PATCH /api/articles/:slug/series — assign article to series
router.patch("/articles/:slug/series", requireAdmin, async (req, res) => {
  const { slug } = req.params;
  const { seriesId, seriesOrder } = req.body;
  try {
    const result = await pool.query(
      "UPDATE articles SET series_id = $1, series_order = $2 WHERE slug = $3 RETURNING id",
      [seriesId ?? null, seriesOrder ?? null, slug]
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update article series" });
  }
});

export default router;
