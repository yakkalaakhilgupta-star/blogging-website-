import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Trash2, Loader2, Plus, ExternalLink, AlertCircle } from "lucide-react";

export default function AdminPortfolio() {
  const { headers } = useAdminAuth();
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", publication: "", url: "", description: "", imageUrl: "", publishedAt: "" });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try {
      const r = await fetch("/api/portfolio");
      setClips(await r.json());
    } catch { setError("Failed to load"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setAdding(true); setError("");
    try {
      const r = await fetch("/api/portfolio", { method: "POST", headers, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Failed to add");
      const clip = await r.json();
      setClips((c) => [clip, ...c]);
      setForm({ title: "", publication: "", url: "", description: "", imageUrl: "", publishedAt: "" });
      setShowForm(false);
    } catch { setError("Failed to add clip"); }
    finally { setAdding(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this clip?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/portfolio/${id}`, { method: "DELETE", headers });
      setClips((c) => c.filter((x) => x.id !== id));
    } catch { alert("Delete failed"); }
    finally { setDeleting(null); }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="font-serif text-3xl font-bold">Portfolio</h1><p className="text-sm text-muted-foreground mt-1">{clips.length} clips</p></div>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Clip
          </button>
        </div>

        {error && <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 mb-6 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}

        {showForm && (
          <form onSubmit={handleAdd} className="bg-card border border-border p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <h2 className="md:col-span-2 font-semibold">New Clip</h2>
            {[
              { key: "title", label: "Title", required: true },
              { key: "publication", label: "Publication", required: true },
              { key: "url", label: "URL", required: true },
              { key: "publishedAt", label: "Published Date", type: "date" },
              { key: "imageUrl", label: "Image URL" },
            ].map(({ key, label, required, type }) => (
              <div key={key}>
                <label className="text-sm font-medium block mb-1">{label}</label>
                <input type={type || "text"} value={(form as any)[key]} required={required}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3}
                className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none resize-none" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={adding}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {adding ? "Adding…" : "Add"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {clips.map((clip) => (
              <div key={clip.id} className="flex items-start gap-4 bg-card border border-border p-4">
                {clip.imageUrl && <img src={clip.imageUrl} alt="" className="w-16 h-16 object-cover shrink-0 border border-border" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{clip.title}</p>
                  <p className="text-sm text-muted-foreground">{clip.publication}</p>
                  {clip.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{clip.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {clip.url && <a href={clip.url} target="_blank" rel="noopener" className="p-1.5 text-muted-foreground hover:text-foreground"><ExternalLink className="h-3.5 w-3.5" /></a>}
                  <button onClick={() => handleDelete(clip.id)} disabled={deleting === clip.id}
                    className="p-1.5 text-muted-foreground hover:text-destructive">
                    {deleting === clip.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            ))}
            {clips.length === 0 && <div className="text-center py-12 text-muted-foreground">No clips yet.</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
