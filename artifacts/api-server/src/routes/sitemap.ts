import { Router } from "express";
import { db } from "@workspace/db";
import { articlesTable, speciesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.get("/sitemap.xml", async (req, res) => {
  const baseUrl = process.env.SITE_URL || `https://${req.hostname}`;

  const [articles, species] = await Promise.all([
    db
      .select({ slug: articlesTable.slug, updatedAt: articlesTable.updatedAt, publishedAt: articlesTable.publishedAt })
      .from(articlesTable)
      .where(eq(articlesTable.status, "published")),
    db
      .select({ slug: speciesTable.slug, createdAt: speciesTable.createdAt })
      .from(speciesTable),
  ]);

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/articles", priority: "0.9", changefreq: "daily" },
    { loc: "/species", priority: "0.8", changefreq: "weekly" },
    { loc: "/portfolio", priority: "0.7", changefreq: "monthly" },
    { loc: "/services", priority: "0.7", changefreq: "monthly" },
    { loc: "/about", priority: "0.6", changefreq: "monthly" },
    { loc: "/contact", priority: "0.5", changefreq: "monthly" },
    { loc: "/newsletter", priority: "0.5", changefreq: "monthly" },
    { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
    { loc: "/terms", priority: "0.3", changefreq: "yearly" },
  ];

  const staticUrls = staticPages
    .map(
      (p) => `  <url>
    <loc>${escapeXml(baseUrl + p.loc)}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  const articleUrls = articles
    .map((a) => {
      const lastmod = new Date(a.updatedAt ?? a.publishedAt).toISOString().split("T")[0];
      return `  <url>
    <loc>${escapeXml(`${baseUrl}/articles/${a.slug}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("\n");

  const speciesUrls = species
    .map((s) => {
      const lastmod = new Date(s.createdAt).toISOString().split("T")[0];
      return `  <url>
    <loc>${escapeXml(`${baseUrl}/species/${s.slug}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${articleUrls}
${speciesUrls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(xml);
});

export default router;
