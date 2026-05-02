import { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentsSectionProps {
  articleSlug: string;
}

export function CommentsSection({ articleSlug }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/articles/${articleSlug}/comments`)
      .then(r => r.json())
      .then(d => setComments(d.comments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [articleSlug]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address";
    if (!content.trim() || content.trim().length < 10) errs.content = "Comment must be at least 10 characters";
    if (content.trim().length > 2000) errs.content = "Comment must be under 2000 characters";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSubmitting(true);
    setError("");
    try {
      const r = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name: name, author_email: email, content }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Failed to submit comment"); return; }
      setSubmitted(true);
      setName(""); setEmail(""); setContent("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 pt-10 border-t border-border">
      <h2 className="font-serif text-3xl text-foreground mb-10 flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-primary" />
        {loading ? "Comments" : `${comments.length} Comment${comments.length !== 1 ? "s" : ""}`}
      </h2>

      {/* Comment list */}
      {!loading && comments.length > 0 && (
        <div className="space-y-8 mb-12">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 bg-muted border border-border flex items-center justify-center">
                <span className="font-serif text-sm font-bold text-muted-foreground">
                  {comment.author_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-medium text-foreground text-sm">{comment.author_name}</span>
                  <time className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), "MMMM d, yyyy")}
                  </time>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-muted-foreground text-sm mb-12">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

      {/* Submit form */}
      <div className="bg-card border border-border p-6 sm:p-8">
        <h3 className="font-serif text-xl text-foreground mb-6">Leave a comment</h3>

        {submitted ? (
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">Comment submitted</p>
              <p className="text-muted-foreground">Your comment is awaiting moderation and will appear shortly once approved.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-primary text-xs font-medium mt-3 hover:underline"
              >
                Leave another comment
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className={fieldErrors.name ? "border-destructive" : ""}
                />
                {fieldErrors.name && <p className="text-xs text-destructive mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email (not published)"
                  className={fieldErrors.email ? "border-destructive" : ""}
                />
                {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
                Comment <span className="text-destructive">*</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Share your thoughts on this essay…"
                rows={5}
                className={`w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${
                  fieldErrors.content ? "border-destructive" : "border-input"
                }`}
              />
              <div className="flex justify-between mt-1">
                {fieldErrors.content
                  ? <p className="text-xs text-destructive">{fieldErrors.content}</p>
                  : <span />}
                <span className="text-xs text-muted-foreground">{content.length}/2000</span>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">Comments are moderated before appearing.</p>
              <Button type="submit" disabled={submitting} className="gap-2">
                <Send className="h-4 w-4" />
                {submitting ? "Submitting…" : "Post Comment"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
