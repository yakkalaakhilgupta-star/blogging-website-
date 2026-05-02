import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trash2, Clock, MessageSquare, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: number;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  created_at: string;
  article_title: string;
  article_slug: string;
}

type Filter = "pending" | "approved" | "all";

export default function AdminComments() {
  const { token } = useAdminAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [processing, setProcessing] = useState<number | null>(null);

  const load = async (f: Filter) => {
    setLoading(true);
    try {
      const qs = f === "all" ? "" : `?approved=${f === "approved"}`;
      const r = await fetch(`/api/comments${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      setComments(d.comments ?? []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(filter); }, [filter, token]);

  const approve = async (id: number) => {
    setProcessing(id);
    await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ approved: true }),
    });
    toast({ title: "Comment approved" });
    setProcessing(null);
    load(filter);
  };

  const reject = async (id: number) => {
    setProcessing(id);
    await fetch(`/api/comments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    toast({ title: "Comment deleted" });
    setProcessing(null);
    load(filter);
  };

  const pending = comments.filter(c => !c.approved);

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Comments</h1>
            <p className="text-muted-foreground mt-1">Moderate reader comments before they appear on articles.</p>
          </div>
          {pending.length > 0 && filter !== "pending" && (
            <Badge variant="destructive" className="mt-1">{pending.length} pending</Badge>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {(["pending", "approved", "all"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                filter === f
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-muted-foreground text-sm">Loading comments…</div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="font-serif text-xl text-foreground mb-2">No {filter === "all" ? "" : filter} comments</p>
            <p className="text-muted-foreground text-sm">
              {filter === "pending" ? "All caught up — no comments awaiting moderation." : "Nothing here yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="bg-card border border-border p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="font-medium text-foreground text-sm">{comment.author_name}</span>
                      <span className="text-muted-foreground text-xs">{comment.author_email}</span>
                      <time className="text-muted-foreground text-xs">
                        {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </time>
                      {comment.approved
                        ? <Badge variant="secondary" className="text-[10px]">Approved</Badge>
                        : <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300"><Clock className="h-2.5 w-2.5 mr-1" />Pending</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>On:</span>
                      <Link href={`/articles/${comment.article_slug}`} className="hover:text-primary flex items-center gap-1">
                        {comment.article_title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!comment.approved && (
                      <Button
                        size="sm" variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50 gap-1.5"
                        disabled={processing === comment.id}
                        onClick={() => approve(comment.id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm" variant="outline"
                      className="text-destructive border-destructive/20 hover:bg-destructive/5 gap-1.5"
                      disabled={processing === comment.id}
                      onClick={() => reject(comment.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
