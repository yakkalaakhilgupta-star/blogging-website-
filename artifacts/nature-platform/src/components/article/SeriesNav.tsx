import { useState, useEffect } from "react";
import { Link } from "wouter";
import { BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";

interface SeriesArticle {
  id: number;
  title: string;
  slug: string;
  seriesOrder: number | null;
}

interface SeriesNavProps {
  articleSlug: string;
  seriesId?: number;
  seriesTitle?: string;
  seriesSlug?: string;
}

export function SeriesNav({ articleSlug, seriesId, seriesTitle, seriesSlug }: SeriesNavProps) {
  const [articles, setArticles] = useState<SeriesArticle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!seriesSlug) return;
    setLoading(true);
    fetch(`/api/series/${seriesSlug}`)
      .then(r => r.json())
      .then(d => setArticles(d.articles ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [seriesSlug]);

  if (!seriesTitle || !seriesSlug || loading || articles.length === 0) return null;

  const currentIndex = articles.findIndex(a => a.slug === articleSlug);
  const prev = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  return (
    <div className="my-12 border border-primary/20 bg-primary/3">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-primary/15 bg-primary/5">
        <BookOpen className="h-4 w-4 text-primary shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Part of a Series</p>
          <p className="font-serif text-lg text-foreground leading-tight">{seriesTitle}</p>
        </div>
      </div>

      {/* Article list */}
      <div className="px-6 py-4">
        <ol className="space-y-2">
          {articles.map((article, i) => {
            const isCurrent = article.slug === articleSlug;
            return (
              <li key={article.id} className="flex items-start gap-3">
                <span className={`shrink-0 w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 ${
                  isCurrent ? "text-primary" : "text-muted-foreground"
                }`}>
                  {isCurrent
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <span>{i + 1}</span>
                  }
                </span>
                {isCurrent ? (
                  <span className="text-sm font-medium text-foreground">{article.title}</span>
                ) : (
                  <Link href={`/articles/${article.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline">
                    {article.title}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Prev / Next navigation */}
      {(prev || next) && (
        <div className="flex border-t border-primary/15">
          {prev && (
            <Link href={`/articles/${prev.slug}`}
              className="flex-1 flex flex-col gap-1 px-6 py-4 hover:bg-primary/5 transition-colors border-r border-primary/15">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">← Previous</span>
              <span className="text-sm font-medium text-foreground line-clamp-1">{prev.title}</span>
            </Link>
          )}
          {!prev && <div className="flex-1" />}
          {next && (
            <Link href={`/articles/${next.slug}`}
              className="flex-1 flex flex-col gap-1 px-6 py-4 hover:bg-primary/5 transition-colors text-right">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Next →</span>
              <span className="text-sm font-medium text-foreground line-clamp-1">{next.title}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
