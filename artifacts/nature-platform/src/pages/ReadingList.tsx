import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useBookmarks } from "@/hooks/useBookmarks";
import { ArticleCard } from "@/components/ui/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Bookmark } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function ReadingList() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookmarks.length === 0) { setLoading(false); return; }
    setLoading(true);
    Promise.all(
      bookmarks.map((slug) =>
        fetch(`/api/articles/${slug}`).then((r) => (r.ok ? r.json() : null))
      )
    )
      .then((results) => setArticles(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [bookmarks.join(",")]);

  return (
    <>
      <Helmet>
        <title>Reading List | The Verdant Page</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="w-full bg-background pt-12 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Bookmark className="h-6 w-6 text-primary" />
              <h1 className="font-serif text-4xl md:text-5xl font-bold">Reading List</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {bookmarks.length === 0
                ? "Articles you bookmark will appear here."
                : `${bookmarks.length} saved article${bookmarks.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookmarks.map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/2] w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <div key={article.id} className="relative group">
                  <ArticleCard article={article} />
                  <button
                    onClick={() => removeBookmark(article.slug)}
                    className="absolute top-3 right-3 bg-background/90 border border-border p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-destructive"
                    title="Remove bookmark"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 border border-dashed border-border">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-6" />
              <h2 className="font-serif text-2xl mb-3">No saved articles yet</h2>
              <p className="text-muted-foreground mb-8">
                Click the bookmark icon on any article to save it here.
              </p>
              <Link href="/articles">
                <span className="inline-block bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold">
                  Browse Articles
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
