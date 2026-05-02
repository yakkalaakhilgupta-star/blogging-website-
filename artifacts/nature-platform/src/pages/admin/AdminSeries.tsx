import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, BookOpen, X, Check } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Series {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  article_count: number;
  created_at: string;
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminSeries() {
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/series", { headers: { Authorization: `Bearer ${token}` } });
      setSeries(await r.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  const openNew = () => {
    setForm({ title: "", slug: "", description: "" });
    setEditingId("new");
  };

  const openEdit = (s: Series) => {
    setForm({ title: s.title, slug: s.slug, description: s.description ?? "" });
    setEditingId(s.id);
  };

  const save = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const isNew = editingId === "new";
      const url = isNew ? "/api/series" : `/api/series/${editingId}`;
      const method = isNew ? "POST" : "PUT";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: form.title, slug: form.slug, description: form.description || null }),
      });
      if (!r.ok) {
        const d = await r.json();
        toast({ title: d.error ?? "Failed to save", variant: "destructive" });
        return;
      }
      toast({ title: isNew ? "Series created" : "Series updated" });
      setEditingId(null);
      load();
    } catch {}
    finally { setSaving(false); }
  };

  const deleteSeries = async (id: number, title: string) => {
    if (!confirm(`Delete series "${title}"? Articles in this series will be unassigned.`)) return;
    await fetch(`/api/series/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    toast({ title: "Series deleted" });
    load();
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Series</h1>
            <p className="text-muted-foreground mt-1">Group related articles into collections for readers to follow.</p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> New Series
          </Button>
        </div>

        {/* New / Edit form */}
        {editingId !== null && (
          <div className="bg-card border border-border p-6 mb-8 space-y-4">
            <h2 className="font-medium text-foreground">{editingId === "new" ? "Create new series" : "Edit series"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Title</label>
                <Input value={form.title} onChange={e => {
                  const t = e.target.value;
                  setForm(f => ({ ...f, title: t, slug: editingId === "new" ? slugify(t) : f.slug }));
                }} placeholder="The Rewilding Series" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Slug</label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="the-rewilding-series" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="A short description of what this series covers…"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={save} disabled={saving} className="gap-2">
                <Check className="h-4 w-4" />
                {saving ? "Saving…" : "Save Series"}
              </Button>
              <Button variant="outline" onClick={() => setEditingId(null)} className="gap-2">
                <X className="h-4 w-4" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-muted-foreground text-sm">Loading series…</div>
        ) : series.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="font-serif text-xl text-foreground mb-2">No series yet</p>
            <p className="text-muted-foreground text-sm">Create a series to group related articles together.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {series.map(s => (
              <div key={s.id} className="bg-card border border-border p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-serif text-lg text-foreground">{s.title}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {s.article_count} article{s.article_count !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">/{s.slug}</p>
                  {s.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Created {format(new Date(s.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5"
                    onClick={() => deleteSeries(s.id, s.title)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
