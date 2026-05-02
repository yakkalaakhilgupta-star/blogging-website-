import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

// GET /api/articles/:slug/comments — approved comments for an article
router.get("/articles/:slug/comments", async (req, res) => {
  const { slug } = req.params;
  try {
    const articleRes = await pool.query(
      "SELECT id FROM articles WHERE slug = $1 AND status = 'published'",
      [slug]
    );
    if (!articleRes.rows[0]) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    const articleId = articleRes.rows[0].id;
    const result = await pool.query(
      `SELECT id, author_name, content, created_at
       FROM comments
       WHERE article_id = $1 AND approved = TRUE
       ORDER BY created_at ASC`,
      [articleId]
    );
    res.json({ comments: result.rows, total: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST /api/articles/:slug/comments — submit a new comment
router.post("/articles/:slug/comments", async (req, res) => {
  const { slug } = req.params;
  const { author_name, author_email, content } = req.body;

  if (!author_name || typeof author_name !== "string" || author_name.trim().length < 2) {
    res.status(400).json({ error: "Name must be at least 2 characters" });
    return;
  }
  if (!author_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(author_email)) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }
  if (!content || typeof content !== "string" || content.trim().length < 10) {
    res.status(400).json({ error: "Comment must be at least 10 characters" });
    return;
  }
  if (content.trim().length > 2000) {
    res.status(400).json({ error: "Comment must be under 2000 characters" });
    return;
  }

  try {
    const articleRes = await pool.query(
      "SELECT id FROM articles WHERE slug = $1 AND status = 'published'",
      [slug]
    );
    if (!articleRes.rows[0]) {
      res.status(404).json({ error: "Article not found" });
      return;
    }
    const articleId = articleRes.rows[0].id;
    await pool.query(
      `INSERT INTO comments (article_id, author_name, author_email, content, approved)
       VALUES ($1, $2, $3, $4, FALSE)`,
      [articleId, author_name.trim(), author_email.trim(), content.trim()]
    );
    res.status(201).json({ message: "Comment submitted and awaiting moderation" });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit comment" });
  }
});

// Admin: GET /api/comments — all comments (pending and approved)
router.get("/comments", requireAdmin, async (req, res) => {
  const { approved } = req.query;
  try {
    let query = `
      SELECT c.id, c.author_name, c.author_email, c.content, c.approved, c.created_at,
             a.title AS article_title, a.slug AS article_slug
      FROM comments c
      JOIN articles a ON a.id = c.article_id
    `;
    const params: any[] = [];
    if (approved !== undefined) {
      query += " WHERE c.approved = $1";
      params.push(approved === "true");
    }
    query += " ORDER BY c.created_at DESC";
    const result = await pool.query(query, params);
    res.json({ comments: result.rows, total: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Admin: PATCH /api/comments/:id — approve or reject a comment
router.patch("/comments/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { approved } = req.body;
  if (typeof approved !== "boolean") {
    res.status(400).json({ error: "approved (boolean) required" });
    return;
  }
  try {
    const result = await pool.query(
      "UPDATE comments SET approved = $1 WHERE id = $2 RETURNING id",
      [approved, id]
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// Admin: DELETE /api/comments/:id
router.delete("/comments/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await pool.query("DELETE FROM comments WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
