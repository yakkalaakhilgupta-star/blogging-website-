import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";

export default function AdminTags() {
  const { headers } = useAdminAuth();
  const [tags, setTags] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTag, setNewTag] = useState({ name: "", slug: "", description: "" });
  const [newCat, setNewCat] = useState({ name: "", slug: "", color: "#2d5016", description: "" });
  const [addingTag, setAddingTag] = useState(false);
  const [addingCat, setAddingCat] = useState(false);

  function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  async function load() {
    try {
      const [tr, cr] = await Promise.all([fetch("/api/tags"), fetch("/api/categories")]);
      setTags(await tr.json());
      setCategories(await cr.json());
    } catch { setError("Failed to load"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleAddTag(e: React.FormEvent) {
    e.preventDefault(); setAddingTag(true); setError("");
    try {
      const r = await fetch("/api/tags", { method: "POST", headers, body: JSON.stringify(newTag) });
      if (!r.ok) throw new Error("Failed");
      const t = await r.json();
      setTags((ts) => [...ts, t]);
      setNewTag({ name: "", slug: "", description: "" });
    } catch { setError("Failed to add tag"); }
    finally { setAddingTag(false); }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault(); setAddingCat(true); setError("");
    try {
      const r = await fetch("/api/categories", { method: "POST", headers, body: JSON.stringify(newCat) });
      if (!r.ok) throw new Error("Failed");
      const c = await r.json();
      setCategories((cs) => [...cs, c]);
      setNewCat({ name: "", slug: "", color: "#2d5016", description: "" });
    } catch { setError("Failed to add category"); }
    finally { setAddingCat(false); }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h1 className="font-serif text-3xl font-bold mb-8">Tags & Categories</h1>
        {error && <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 mb-6 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
        {loading ? (
          <div className="flex justify-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tags */}
            <div>
              <h2 className="font-semibold text-lg mb-4">Tags ({tags.length})</h2>
              <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
                <input value={newTag.name} required placeholder="Tag name"
                  onChange={(e) => setNewTag((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                  className="flex-1 border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" />
                <button type="submit" disabled={addingTag}
                  className="bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                  {addingTag ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </button>
              </form>
              <div className="bg-card border border-border divide-y divide-border">
                {tags.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">#{t.slug}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.articleCount ?? ""}</span>
                  </div>
                ))}
                {tags.length === 0 && <div className="px-4 py-8 text-center text-muted-foreground text-sm">No tags yet.</div>}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h2 className="font-semibold text-lg mb-4">Categories ({categories.length})</h2>
              <form onSubmit={handleAddCategory} className="space-y-2 mb-4">
                <div className="flex gap-2">
                  <input value={newCat.name} required placeholder="Category name"
                    onChange={(e) => setNewCat((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                    className="flex-1 border border-border px-3 py-2 text-sm bg-background focus:outline-none" />
                  <input type="color" value={newCat.color}
                    onChange={(e) => setNewCat((f) => ({ ...f, color: e.target.value }))}
                    className="w-10 h-10 border border-border cursor-pointer" title="Pick color" />
                  <button type="submit" disabled={addingCat}
                    className="bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                    {addingCat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </button>
                </div>
              </form>
              <div className="bg-card border border-border divide-y divide-border">
                {categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {c.color && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />}
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.slug}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && <div className="px-4 py-8 text-center text-muted-foreground text-sm">No categories yet.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
