import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ArrowLeft, Loader2, Eye, Save, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const MDEditor = lazy(() => import("@uiw/react-md-editor"));

const CATEGORIES = ["Ecology", "Conservation", "Field Notes", "Science", "Essay", "Interview", "Review"];
const STATUSES = ["published", "draft"];

function wordCount(text: string) { return text.trim().split(/\s+/).filter(Boolean).length; }
function readTime(wc: number) { return Math.max(1, Math.ceil(wc / 200)); }

export default function AdminArticleEdit() {
  const params = useParams<{ slug?: string }>();
  const isNew = !params.slug || params.slug === "new";
  const { headers } = useAdminAuth();
  const [, nav] = useLocation();

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", category: CATEGORIES[0],
    status: "draft", imageUrl: "", imageAlt: "", featured: false,
    seoTitle: "", seoDescription: "", readTime: 5,
  });
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const wc = wordCount(form.content);
  const rt = readTime(wc);

  useEffect(() => {
    fetch("/api/tags").then((r) => r.json()).then(setAllTags).catch(() => {});
    if (!isNew && params.slug) {
      fetch(`/api/articles/${params.slug}`, { headers })
        .then((r) => r.json())
        .then((a) => {
          setForm({
            title: a.title ?? "", slug: a.slug ?? "", excerpt: a.excerpt ?? "",
            content: a.content ?? "", category: a.category ?? CATEGORIES[0],
            status: a.status ?? "draft", imageUrl: a.imageUrl ?? "", imageAlt: a.imageAlt ?? "",
            featured: a.featured ?? false, seoTitle: a.seoTitle ?? "", seoDescription: a.seoDescription ?? "",
            readTime: a.readTime ?? 5,
          });
          setTagIds((a.tags ?? []).map((t: any) => t.id));
        })
        .catch(() => setError("Failed to load article"))
        .finally(() => setLoading(false));
    }
  }, [params.slug]);

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function set(key: string, val: any) {
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "title" && isNew) next.slug = slugify(val);
      if (key === "content") next.readTime = readTime(wordCount(val));
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setSaving(true);
    try {
      const body = JSON.stringify({ ...form, readTime: rt, tagIds });
      const url = isNew ? "/api/articles" : `/api/articles/${params.slug}`;
      const method = isNew ? "POST" : "PUT";
      const r = await fetch(url, { method, headers, body });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error?.message || d.error || "Save failed");
      }
      const saved = await r.json();
      setSuccess("Saved!");
      if (isNew) nav(`/admin/articles/${saved.slug}/edit`);
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally { setSaving(false); }
  }

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center gap-2 text-muted-foreground py-20 justify-center">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/articles">
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
              <ArrowLeft className="h-4 w-4" /> Articles
            </span>
          </Link>
          <h1 className="font-serif text-2xl font-bold">{isNew ? "New Article" : "Edit Article"}</h1>
          {!isNew && (
            <a href={`/articles/${params.slug}`} target="_blank" rel="noopener"
              className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <Eye className="h-4 w-4" /> Preview
            </a>
          )}
        </div>

        {error && <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 mb-6 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
        {success && <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 mb-6 text-sm">{success}</div>}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main fields */}
            <div className="lg:col-span-2 space-y-5">
              <Field label="Title" required>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} required
                  className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </Field>
              <Field label="Slug" required>
                <input value={form.slug} onChange={(e) => set("slug", e.target.value)} required
                  className="w-full border border-border px-3 py-2 bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary" />
              </Field>
              <Field label="Excerpt" required>
                <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={3} required
                  className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </Field>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">Content</label>
                  <span className="text-xs text-muted-foreground">{wc.toLocaleString()} words · ~{rt} min read</span>
                </div>
                <div data-color-mode="light" className="border border-border">
                  <Suspense fallback={
                    <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={20}
                      placeholder="Write in Markdown..."
                      className="w-full px-3 py-2 bg-background text-sm focus:outline-none font-mono resize-none" />
                  }>
                    <MDEditor value={form.content} onChange={(v) => set("content", v ?? "")} height={500}
                      preview="live" hideToolbar={false} />
                  </Suspense>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <Field label="Status">
                <select value={form.status} onChange={(e) => set("status", e.target.value)}
                  className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Category">
                <select value={form.category} onChange={(e) => set("category", e.target.value)}
                  className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Image URL">
                <input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://..."
                  className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none" />
                {form.imageUrl && <img src={form.imageUrl} alt="preview" className="mt-2 w-full aspect-video object-cover border border-border" onError={(e) => (e.currentTarget.style.display = "none")} />}
              </Field>
              <Field label="Image Alt Text">
                <input value={form.imageAlt} onChange={(e) => set("imageAlt", e.target.value)}
                  className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none" />
              </Field>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-primary" />
                Featured article
              </label>
              {allTags.length > 0 && (
                <Field label="Tags">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {allTags.map((t) => (
                      <label key={t.id} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input type="checkbox" checked={tagIds.includes(t.id)}
                          onChange={(e) => setTagIds((ids) => e.target.checked ? [...ids, t.id] : ids.filter((i) => i !== t.id))}
                          className="accent-primary" />
                        {t.name}
                      </label>
                    ))}
                  </div>
                </Field>
              )}
              <Field label="SEO Title">
                <input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)}
                  className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none" />
              </Field>
              <Field label="SEO Description">
                <textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={3}
                  className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none resize-none" />
              </Field>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save Article"}
            </button>
            <Link href="/admin/articles">
              <span className="inline-block border border-border px-5 py-2.5 text-sm hover:bg-muted transition-colors cursor-pointer">Cancel</span>
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}{required && <span className="text-destructive ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
