import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2, AlertCircle, Trash2, Send, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

type Tab = "subscribers" | "broadcast";

export default function AdminNewsletter() {
  const { headers } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("subscribers");
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [broadcast, setBroadcast] = useState({ subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string>("");

  async function loadSubscribers() {
    try {
      const r = await fetch("/api/newsletter", { headers });
      if (!r.ok) throw new Error();
      setSubscribers(await r.json());
    } catch { setError("Failed to load subscribers"); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadSubscribers(); }, []);

  async function handleDelete(id: number, email: string) {
    if (!confirm(`Remove ${email}?`)) return;
    setDeleting(id);
    try {
      await fetch("/api/newsletter/unsubscribe", { method: "POST", headers, body: JSON.stringify({ email }) });
      setSubscribers((s) => s.filter((x) => x.id !== id));
    } catch { alert("Failed"); }
    finally { setDeleting(null); }
  }

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault(); setSending(true); setBroadcastResult("");
    try {
      const r = await fetch("/api/newsletter/broadcast", {
        method: "POST", headers, body: JSON.stringify(broadcast),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      setBroadcastResult(`Sent to ${d.sent} subscriber${d.sent !== 1 ? "s" : ""}. ${d.skipped ? `${d.skipped} skipped (unconfirmed).` : ""}`);
      setBroadcast({ subject: "", body: "" });
    } catch (err: any) { setBroadcastResult(`Error: ${err.message}`); }
    finally { setSending(false); }
  }

  const confirmed = subscribers.filter((s) => s.confirmed);
  const unconfirmed = subscribers.filter((s) => !s.confirmed);

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h1 className="font-serif text-3xl font-bold mb-2">Newsletter</h1>
        <p className="text-muted-foreground text-sm mb-8">
          {subscribers.length} total · {confirmed.length} confirmed · {unconfirmed.length} pending
        </p>

        {/* Tabs */}
        <div className="flex border-b border-border mb-8">
          {(["subscribers", "broadcast"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "subscribers" && (
          <>
            {error && <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-3 mb-6 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
            {loading ? (
              <div className="flex justify-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
              <div className="bg-card border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Confirmed</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {subscribers.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono text-xs">{s.email}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.name || "—"}</td>
                        <td className="px-4 py-3">
                          {s.confirmed
                            ? <CheckCircle className="h-4 w-4 text-green-500" />
                            : <XCircle className="h-4 w-4 text-muted-foreground" />}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                          {s.createdAt ? format(new Date(s.createdAt), "MMM d, yyyy") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDelete(s.id, s.email)} disabled={deleting === s.id}
                            className="p-1.5 text-muted-foreground hover:text-destructive">
                            {deleting === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {subscribers.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No subscribers yet.</div>}
              </div>
            )}
          </>
        )}

        {tab === "broadcast" && (
          <form onSubmit={handleBroadcast} className="space-y-5 max-w-2xl">
            <div className="bg-primary/5 border border-primary/20 px-4 py-3 text-sm">
              <strong>{confirmed.length}</strong> confirmed subscriber{confirmed.length !== 1 ? "s" : ""} will receive this email.
              {unconfirmed.length > 0 && <span className="text-muted-foreground"> {unconfirmed.length} unconfirmed will be skipped.</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Subject<span className="text-destructive ml-0.5">*</span></label>
              <input value={broadcast.subject} onChange={(e) => setBroadcast((b) => ({ ...b, subject: e.target.value }))} required
                className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Body (Markdown)<span className="text-destructive ml-0.5">*</span></label>
              <textarea value={broadcast.body} onChange={(e) => setBroadcast((b) => ({ ...b, body: e.target.value }))} rows={12} required
                placeholder="Write your newsletter content in Markdown..."
                className="w-full border border-border px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono resize-none" />
            </div>
            {broadcastResult && (
              <div className={`px-4 py-3 text-sm ${broadcastResult.startsWith("Error") ? "bg-destructive/10 text-destructive" : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"}`}>
                {broadcastResult}
              </div>
            )}
            <button type="submit" disabled={sending || confirmed.length === 0}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending…" : `Send to ${confirmed.length} subscriber${confirmed.length !== 1 ? "s" : ""}`}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
