import { Router } from "express";
import { db } from "@workspace/db";
import { pageViewsTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

router.post("/analytics/pageview", async (req, res) => {
  try {
    const { path, referrer } = req.body;
    if (!path || typeof path !== "string") {
      res.status(400).json({ error: "path required" });
      return;
    }
    await db.insert(pageViewsTable).values({
      path: path.slice(0, 500),
      referrer: referrer ? String(referrer).slice(0, 500) : null,
    });
    res.status(201).json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to record" });
  }
});

router.get("/analytics/summary", requireAdmin, async (req, res) => {
  const [totalViews, topPages] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(pageViewsTable),
    db.select({
      path: pageViewsTable.path,
      count: sql<number>`count(*)`,
    })
      .from(pageViewsTable)
      .groupBy(pageViewsTable.path)
      .orderBy(desc(sql`count(*)`))
      .limit(10),
  ]);
  res.json({
    totalViews: Number(totalViews[0]?.count ?? 0),
    topPages: topPages.map((r) => ({ path: r.path, count: Number(r.count) })),
  });
});

export default router;
