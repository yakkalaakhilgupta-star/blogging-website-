import { Router } from "express";
import { db } from "@workspace/db";
import { articlesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.get("/feed.xml", async (req, res) => {
  const articles = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.status, "published"))
    .orderBy(sql`${articlesTable.publishedAt} desc`)
    .limit(20);

  const baseUrl = process.env.SITE_URL || `https://${req.hostname}`;

  const items = articles
    .map((article) => {
      const pubDate = new Date(article.publishedAt).toUTCString();
      const link = `${baseUrl}/articles/${article.slug}`;
      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(article.excerpt)}</description>
      <category>${escapeXml(article.category)}</category>
      <pubDate>${pubDate}</pubDate>
      ${article.imageUrl ? `<enclosure url="${escapeXml(article.imageUrl)}" type="image/jpeg" length="0" />` : ""}
    </item>`.trim();
    })
    .join("\n    ");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>The Verdant Page</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Science and storytelling from the natural world. Rigorous science wrapped in lyrical prose.</description>
    <language>en-us</language>
    <atom:link href="${escapeXml(baseUrl + "/api/feed.xml")}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(xml);
});

export default router;
