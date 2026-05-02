import { useParams, Link } from "wouter";
import { useListArticles, getListArticlesQueryKey } from "@workspace/api-client-react";
import { ArticleCard } from "@/components/ui/article-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Tag, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function TagPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data, isLoading } = useListArticles(
    { tag: slug },
    { query: { queryKey: getListArticlesQueryKey({ tag: slug }) } }
  );

  const tagName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="w-full bg-background pt-12 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link href="/articles" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> All articles
          </Link>
        </div>

        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
              #{tagName}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-5 w-48" />
            ) : (
              `${data?.total ?? 0} article${data?.total !== 1 ? "s" : ""} tagged with "${tagName}"`
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-4">
                <Skeleton className="aspect-[3/2] w-full rounded-none" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.articles && data.articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="h-full"
              >
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/20 border border-dashed border-border flex flex-col items-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
            <h3 className="font-serif text-2xl text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground">No articles have been tagged with "{tagName}" yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
