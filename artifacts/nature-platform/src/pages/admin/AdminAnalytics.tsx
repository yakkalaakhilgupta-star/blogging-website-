import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Loader2, AlertCircle, Eye, Users, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AdminAnalytics() {
  const { headers } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/summary", { headers }).then((r) => r.json()),
      fetch("/api/analytics/vitals", { headers }).then((r) => r.json()).catch(() => []),
    ])
      .then(([summary, vitalsData]) => { setData(summary); setVitals(Array.isArray(vitalsData) ? vitalsData : []); })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="flex justify-center py-20 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div></AdminLayout>;
  if (error) return <AdminLayout><div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-4"><AlertCircle className="h-4 w-4" />{error}</div></AdminLayout>;

  const topArticleViews = (data?.topPages ?? []).filter((p: any) => p.path?.startsWith("/articles/"));

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <h1 className="font-serif text-3xl font-bold mb-8">Analytics</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Eye} label="Total Page Views" value={(data?.totalViews ?? 0).toLocaleString()} />
          <StatCard icon={Users} label="Unique Pages Tracked" value={(data?.topPages?.length ?? 0).toString()} />
          <StatCard icon={TrendingUp} label="Top Page Views" value={(data?.topPages?.[0]?.count ?? 0).toLocaleString()} />
          <StatCard icon={Activity} label="Vitals Samples" value={vitals.reduce((s: number, v: any) => s + Number(v.count ?? 0), 0).toLocaleString()} />
        </div>

        {/* Top pages */}
        <div className="bg-card border border-border mb-8">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold">Top Pages</h2>
          </div>
          <div className="divide-y divide-border">
            {(data?.topPages ?? []).slice(0, 15).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}</span>
                  <span className="text-sm font-mono text-muted-foreground truncate">{p.path}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full"
                      style={{ width: `${Math.min(100, (p.count / (data?.topPages?.[0]?.count || 1)) * 100)}%` }} />
                  </div>
                  <span className="text-sm font-medium tabular-nums w-12 text-right">{Number(p.count).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {!data?.topPages?.length && <div className="px-6 py-8 text-center text-muted-foreground text-sm">No page view data yet.</div>}
          </div>
        </div>

        {/* Web Vitals */}
        {vitals.length > 0 && (
          <div className="bg-card border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold">Web Vitals (30-day avg)</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-y divide-border">
              {vitals.map((v: any) => (
                <div key={v.metric_name} className="p-5">
                  <p className="text-xs font-mono text-muted-foreground mb-1">{v.metric_name}</p>
                  <p className="text-2xl font-bold">{Number(v.avg_value).toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">P75: {Number(v.p75).toFixed(1)} · {Number(v.count).toLocaleString()} samples</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-card border border-border p-5">
      <Icon className="h-4 w-4 text-primary mb-3" />
      <p className="text-2xl font-bold mb-0.5">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
