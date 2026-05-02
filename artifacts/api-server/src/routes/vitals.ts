import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

router.post("/analytics/vitals", async (req, res) => {
  // sendBeacon may send text/plain — parse manually if needed
  let body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    try {
      body = JSON.parse(String(req.body));
    } catch {
      res.status(400).json({ error: "Invalid body" });
      return;
    }
  }
  const { name, value, rating, page, delta } = body;
  if (!name || value === undefined) {
    res.status(400).json({ error: "name and value required" });
    return;
  }
  try {
    await pool.query(
      "INSERT INTO web_vitals (metric_name, value, rating, page, delta) VALUES ($1, $2, $3, $4, $5)",
      [String(name), Number(value), rating ?? null, page ?? null, delta ?? null]
    );
    res.status(201).json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to record vital" });
  }
});

router.get("/analytics/vitals", requireAdmin, async (req, res) => {
  const result = await pool.query(`
    SELECT metric_name, 
           ROUND(AVG(value)::numeric, 2) AS avg_value,
           ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value)::numeric, 2) AS p75,
           COUNT(*) AS count
    FROM web_vitals
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY metric_name
    ORDER BY metric_name
  `);
  res.json(result.rows);
});

export default router;
