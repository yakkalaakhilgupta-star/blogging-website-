import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Edit, Trash2, Eye, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminArticles() {
  const { headers } = useAdminAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/articles?limit=200&status=all", { headers });
      if (!r.ok) throw new Error("Failed to load");
      const d = await r.json();
      setArticles(d.articles || d);
    } catch { setError("Failed to load articles"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setDeleting(slug);
    try {
      await fetch(`/api/articles/${slug}`, { method: "DELETE", headers });
      setArticles((a) => a.filter((x) => x.slug !== slug));
    } catch { alert("Delete failed"); }
    finally { setDeleting(null); }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">Articles</h1>
            <p className="text-muted-foreground text-sm mt-1">{articles.length} total</p>
          </div>
          <Link href="/admin/articles/new">
            <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
              <Plus className="h-4 w-4" /> New Article
            </span>
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 mb-6 text-sm">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading articles…
          </div>
        ) : (
          <div className="bg-card border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Published</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Views</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium line-clamp-1">{a.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{a.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{a.category}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        a.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                      {a.publishedAt ? format(new Date(a.publishedAt), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{(a.viewCount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <a href={`/articles/${a.slug}`} target="_blank" rel="noopener"
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Preview">
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                        <Link href={`/admin/articles/${a.slug}/edit`}>
                          <span className="p-1.5 text-muted-foreground hover:text-foreground transition-colors inline-block cursor-pointer" title="Edit">
                            <Edit className="h-3.5 w-3.5" />
                          </span>
                        </Link>
                        <button onClick={() => handleDelete(a.slug)} disabled={deleting === a.slug}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                          {deleting === a.slug ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {articles.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p>No articles yet.</p>
                <Link href="/admin/articles/new"><span className="text-primary underline text-sm mt-2 inline-block cursor-pointer">Create your first article</span></Link>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
