import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";

const CONSERVATION = ["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD"];

export default function AdminSpeciesEdit() {
  const params = useParams<{ slug?: string }>();
  const isNew = !params.slug || params.slug === "new";
  const { headers } = useAdminAuth();
  const [, nav] = useLocation();

  const [form, setForm] = useState({
    commonName: "", scientificName: "", slug: "", kingdom: "", speciesClass: "",
    orderName: "", family: "", conservationStatus: "", habitat: "",
    geographicRange: "", diet: "", description: "", funFacts: "",
    imageUrl: "", iucnUrl: "",
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }
  function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  useEffect(() => {
    if (!isNew && params.slug) {
      fetch(`/api/species/${params.slug}`)
        .then((r) => r.json())
        .then((d) => setForm({ commonName: d.commonName ?? "", scientificName: d.scientificName ?? "", slug: d.slug ?? "", kingdom: d.kingdom ?? "", speciesClass: d.speciesClass ?? "", orderName: d.orderName ?? "", family: d.family ?? "", conservationStatus: d.conservationStatus ?? "", habitat: d.habitat ?? "", geographicRange: d.geographicRange ?? "", diet: d.diet ?? "", description: d.description ?? "", funFacts: d.funFacts ?? "", imageUrl: d.imageUrl ?? "", iucnUrl: d.iucnUrl ?? "" }))
        .catch(() => setError("Failed to load"))
        .finally(() => setLoading(false));
    }
  }, [params.slug]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const url = isNew ? "/api/species" : `/api/species/${params.slug}`;
      const r = await fetch(url, { method: isNew ? "POST" : "PUT", headers, body: JSON.stringify(form) });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error?.message || "Save failed"); }
      const saved = await r.json();
      nav(`/admin/species/${saved.slug}/edit`);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/species"><span className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer"><ArrowLeft className="h-4 w-4" />Species</span></Link>
          <h1 className="font-serif text-2xl font-bold">{isNew ? "New Species" : "Edit Species"}</h1>
        </div>
        {error && <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 mb-6 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: "commonName", label: "Common Name", required: true },
            { key: "scientificName", label: "Scientific Name", required: true },
            { key: "slug", label: "Slug", required: true },
            { key: "kingdom", label: "Kingdom" },
            { key: "speciesClass", label: "Class" },
            { key: "orderName", label: "Order" },
            { key: "family", label: "Family" },
            { key: "habitat", label: "Habitat" },
            { key: "geographicRange", label: "Geographic Range" },
            { key: "diet", label: "Diet" },
            { key: "imageUrl", label: "Image URL" },
            { key: "iucnUrl", label: "IUCN URL" },
          ].map(({ key, label, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}{required && <span className="text-destructive ml-0.5">*</span>}</label>
              <input value={(form as any)[key]} required={required}
                onChange={(e) => { set(key, e.target.value); if (key === "commonName" && isNew) set("slug", slugify(e.target.value)); }}
                className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Conservation Status</label>
            <select value={form.conservationStatus} onChange={(e) => set("conservationStatus", e.target.value)}
              className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none">
              <option value="">—</option>
              {CONSERVATION.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5}
              className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Fun Facts</label>
            <textarea value={form.funFacts} onChange={(e) => set("funFacts", e.target.value)} rows={3}
              className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none resize-none" />
          </div>
          <div className="md:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save"}
            </button>
            <Link href="/admin/species"><span className="inline-block border border-border px-5 py-2.5 text-sm hover:bg-muted cursor-pointer">Cancel</span></Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
