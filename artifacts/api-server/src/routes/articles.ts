import { Router } from "express";
import { db } from "@workspace/db";
import { articlesTable, articleTagsTable, tagsTable } from "@workspace/db";
import { eq, ilike, sql, and, inArray, lt } from "drizzle-orm";
import { pool } from "@workspace/db";
import {
  ListArticlesQueryParams,
  CreateArticleBody,
  GetArticleParams,
  UpdateArticleBody,
  UpdateArticleParams,
  DeleteArticleParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

async function attachTags(articles: (typeof articlesTable.$inferSelect)[]) {
  if (articles.length === 0) return articles.map((a) => ({ ...a, tags: [] }));
  const ids = articles.map((a) => a.id);
  const rows = await db
    .select({ articleId: articleTagsTable.articleId, tag: tagsTable })
    .from(articleTagsTable)
    .innerJoin(tagsTable, eq(articleTagsTable.tagId, tagsTable.id))
    .where(inArray(articleTagsTable.articleId, ids));
  const tagMap = new Map<number, (typeof tagsTable.$inferSelect)[]>();
  for (const r of rows) {
    if (!tagMap.has(r.articleId)) tagMap.set(r.articleId, []);
    tagMap.get(r.articleId)!.push(r.tag);
  }
  return articles.map((a) => ({ ...a, tags: tagMap.get(a.id) ?? [] }));
}

// Full-text search endpoint
router.get("/articles/search", async (req, res) => {
  const q = req.query.q as string;
  const limitParam = Number(req.query.limit) || 10;
  if (!q || q.trim().length < 2) {
    res.json({ articles: [], total: 0 });
    return;
  }
  try {
    const result = await pool.query(
      `SELECT * FROM articles
       WHERE status = 'published'
         AND (
           to_tsvector('english', title || ' ' || content || ' ' || excerpt) @@ plainto_tsquery('english', $1)
           OR title ILIKE $2
         )
       ORDER BY
         ts_rank(to_tsvector('english', title || ' ' || content || ' ' || excerpt), plainto_tsquery('english', $1)) DESC,
         published_at DESC
       LIMIT $3`,
      [q, `%${q}%`, limitParam]
    );
    const articles = result.rows.map((r) => ({
      id: r.id, title: r.title, slug: r.slug, excerpt: r.excerpt,
      category: r.category, imageUrl: r.image_url, imageAlt: r.image_alt,
      readTime: r.read_time, featured: r.featured, status: r.status,
      viewCount: r.view_count, publishedAt: r.published_at,
      updatedAt: r.updated_at, createdAt: r.created_at,
    }));
    res.json({ articles, total: articles.length });
  } catch (err) {
    console.error("[search] Error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

router.get("/articles", async (req, res) => {
  const parsed = ListArticlesQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  const { category, tag, featured, status, limit, offset, search } = parsed.data;
  const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

  const conditions = [];
  if (category) conditions.push(eq(articlesTable.category, category));
  if (featured !== undefined) conditions.push(eq(articlesTable.featured, featured));
  if (status) conditions.push(eq(articlesTable.status, status));
  else conditions.push(eq(articlesTable.status, "published"));
  if (search) conditions.push(ilike(articlesTable.title, `%${search}%`));
  // Cursor-based pagination: get articles published before the cursor article
  if (cursor) conditions.push(lt(articlesTable.id, cursor));

  const where = and(...conditions);

  let articleIds: number[] | undefined;
  if (tag) {
    const tagRows = await db
      .select({ articleId: articleTagsTable.articleId })
      .from(articleTagsTable)
      .innerJoin(tagsTable, eq(articleTagsTable.tagId, tagsTable.id))
      .where(eq(tagsTable.slug, tag));
    articleIds = tagRows.map((r) => r.articleId);
    if (articleIds.length === 0) { res.json({ articles: [], total: 0, nextCursor: null }); return; }
  }

  const finalWhere = articleIds
    ? and(where, inArray(articlesTable.id, articleIds))
    : where;

  const [rawArticles, countResult] = await Promise.all([
    db.select().from(articlesTable).where(finalWhere)
      .orderBy(sql`${articlesTable.publishedAt} desc`).limit(limit).offset(cursor ? 0 : offset),
    db.select({ count: sql<number>`count(*)` }).from(articlesTable).where(
      // Count without cursor for accurate total
      articleIds
        ? and(
            category ? eq(articlesTable.category, category) : undefined,
            featured !== undefined ? eq(articlesTable.featured, featured) : undefined,
            status ? eq(articlesTable.status, status) : eq(articlesTable.status, "published"),
            search ? ilike(articlesTable.title, `%${search}%`) : undefined,
            inArray(articlesTable.id, articleIds)
          )
        : and(
            category ? eq(articlesTable.category, category) : undefined,
            featured !== undefined ? eq(articlesTable.featured, featured) : undefined,
            status ? eq(articlesTable.status, status) : eq(articlesTable.status, "published"),
            search ? ilike(articlesTable.title, `%${search}%`) : undefined,
          )
    ),
  ]);

  const articles = await attachTags(rawArticles);
  const nextCursor = rawArticles.length === limit ? rawArticles[rawArticles.length - 1].id : null;
  res.json({ articles, total: Number(countResult[0]?.count ?? 0), nextCursor });
});

router.get("/articles/featured", async (_req, res) => {
  const rawArticles = await db.select().from(articlesTable)
    .where(and(eq(articlesTable.featured, true), eq(articlesTable.status, "published")))
    .orderBy(sql`${articlesTable.publishedAt} desc`).limit(3);
  const articles = await attachTags(rawArticles);
  res.json(articles);
});

router.get("/articles/stats", async (_req, res) => {
  const [total, byCategory, featuredCount, viewsResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(articlesTable).where(eq(articlesTable.status, "published")),
    db.select({ category: articlesTable.category, count: sql<number>`count(*)` })
      .from(articlesTable).where(eq(articlesTable.status, "published")).groupBy(articlesTable.category),
    db.select({ count: sql<number>`count(*)` }).from(articlesTable)
      .where(and(eq(articlesTable.featured, true), eq(articlesTable.status, "published"))),
    db.select({ total: sql<number>`sum(view_count)` }).from(articlesTable),
  ]);
  res.json({
    total: Number(total[0]?.count ?? 0),
    byCategory: byCategory.map((r) => ({ category: r.category, count: Number(r.count) })),
    featuredCount: Number(featuredCount[0]?.count ?? 0),
    totalViews: Number(viewsResult[0]?.total ?? 0),
  });
});

router.get("/articles/:slug", async (req, res) => {
  const parsed = GetArticleParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  const [article] = await db.select().from(articlesTable).where(eq(articlesTable.slug, parsed.data.slug));
  if (!article) { res.status(404).json({ error: "Article not found" }); return; }
  await db.update(articlesTable).set({ viewCount: sql`${articlesTable.viewCount} + 1` })
    .where(eq(articlesTable.id, article.id));
  const [withTags] = await attachTags([{ ...article, viewCount: article.viewCount + 1 }]);
  res.json(withTags);
});

router.post("/articles", requireAdmin, async (req, res) => {
  const parsed = CreateArticleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  const { tagIds, ...data } = parsed.data;
  const wordCount = data.content.split(/\s+/).length;
  const [article] = await db.insert(articlesTable).values({ ...data, wordCount }).returning();
  if (tagIds && tagIds.length > 0) {
    await db.insert(articleTagsTable).values(tagIds.map((tid) => ({ articleId: article.id, tagId: tid })));
  }
  const [withTags] = await attachTags([article]);
  res.status(201).json(withTags);
});

router.put("/articles/:slug", requireAdmin, async (req, res) => {
  const paramsParsed = UpdateArticleParams.safeParse(req.params);
  const bodyParsed = UpdateArticleBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const { tagIds, ...data } = bodyParsed.data;
  const wordCount = data.content ? data.content.split(/\s+/).length : undefined;
  const [article] = await db.update(articlesTable)
    .set({ ...data, ...(wordCount ? { wordCount } : {}), updatedAt: new Date() })
    .where(eq(articlesTable.slug, paramsParsed.data.slug)).returning();
  if (!article) { res.status(404).json({ error: "Article not found" }); return; }
  if (tagIds !== null && tagIds !== undefined) {
    await db.delete(articleTagsTable).where(eq(articleTagsTable.articleId, article.id));
    if (tagIds.length > 0) {
      await db.insert(articleTagsTable).values(tagIds.map((tid) => ({ articleId: article.id, tagId: tid })));
    }
  }
  const [withTags] = await attachTags([article]);
  res.json(withTags);
});

router.delete("/articles/:slug", requireAdmin, async (req, res) => {
  const parsed = DeleteArticleParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  await db.delete(articlesTable).where(eq(articlesTable.slug, parsed.data.slug));
  res.status(204).send();
});

export default router;
