import { Link } from "wouter";
import { useListArticles, getListArticlesQueryKey } from "@workspace/api-client-react";
import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

interface RelatedArticlesProps {
  currentSlug: string;
  category: string;
}

export function RelatedArticles({ currentSlug, category }: RelatedArticlesProps) {
  const { data } = useListArticles(
    { category, limit: 4 },
    { query: { queryKey: getListArticlesQueryKey({ category, limit: 4 }) } }
  );

  const related = data?.articles.filter((a) => a.slug !== currentSlug).slice(0, 3) ?? [];

  if (related.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="font-serif text-2xl font-bold mb-8">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((article) => {
          const date = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt);
          return (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <div className="group border border-border hover:border-primary/30 bg-card transition-all h-full flex flex-col">
                {article.imageUrl && (
                  <div className="aspect-[3/2] overflow-hidden bg-muted">
                    <img
                      src={article.imageUrl}
                      alt={article.imageAlt || article.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                    {article.category}
                  </span>
                  <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-grow">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(date, "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime} min
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
