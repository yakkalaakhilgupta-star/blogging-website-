import { useState, useEffect } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Plus, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";

export default function AdminSpecies() {
  const { headers } = useAdminAuth();
  const [species, setSpecies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const r = await fetch("/api/species");
      const d = await r.json();
      setSpecies(Array.isArray(d) ? d : d.species ?? []);
    } catch { setError("Failed to load species"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number, slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/species/${slug}`, { method: "DELETE", headers });
      setSpecies((s) => s.filter((x) => x.id !== id));
    } catch { alert("Delete failed"); }
    finally { setDeleting(null); }
  }

  const CONSERVATION_COLORS: Record<string, string> = {
    "CR": "bg-red-100 text-red-700", "EN": "bg-orange-100 text-orange-700",
    "VU": "bg-yellow-100 text-yellow-700", "NT": "bg-blue-100 text-blue-700",
    "LC": "bg-green-100 text-green-700",
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">Species</h1>
            <p className="text-muted-foreground text-sm mt-1">{species.length} total</p>
          </div>
          <Link href="/admin/species/new">
            <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 cursor-pointer">
              <Plus className="h-4 w-4" /> New Species
            </span>
          </Link>
        </div>
        {error && <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 mb-6 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
        {loading ? (
          <div className="flex items-center gap-2 justify-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading…</div>
        ) : (
          <div className="bg-card border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Scientific</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {species.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.commonName}</p>
                      <p className="text-muted-foreground text-xs">{s.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground italic text-xs hidden md:table-cell">{s.scientificName}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {s.conservationStatus && (
                        <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${CONSERVATION_COLORS[s.conservationStatus] || "bg-muted text-muted-foreground"}`}>
                          {s.conservationStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/admin/species/${s.slug}/edit`}>
                          <span className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer inline-block"><Edit className="h-3.5 w-3.5" /></span>
                        </Link>
                        <button onClick={() => handleDelete(s.id, s.slug)} disabled={deleting === s.id}
                          className="p-1.5 text-muted-foreground hover:text-destructive">
                          {deleting === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {species.length === 0 && <div className="text-center py-12 text-muted-foreground">No species yet.</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
