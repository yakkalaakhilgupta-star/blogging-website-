import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { useListArticles, getListArticlesQueryKey, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { ArticleCard } from "@/components/ui/article-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, BookOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const PAGE_SIZE = 9;

function getParams() {
  const sp = new URLSearchParams(window.location.search);
  return {
    q: sp.get("q") ?? "",
    category: sp.get("category") ?? "All",
  };
}

export default function Articles() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState(() => getParams().q);
  const [category, setCategory] = useState(() => getParams().category);
  const [appliedSearch, setAppliedSearch] = useState(() => getParams().q);
  const [cursor, setCursor] = useState<number | null>(null);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Sync URL when filters change
  function pushUrl(q: string, cat: string) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (cat && cat !== "All") sp.set("category", cat);
    const qs = sp.toString();
    navigate(`/articles${qs ? `?${qs}` : ""}`, { replace: true });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search);
    setCursor(null);
    setAllArticles([]);
    setHasMore(true);
    pushUrl(search, category);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setCursor(null);
    setAllArticles([]);
    setHasMore(true);
    pushUrl(appliedSearch, cat);
  };

  const { data: categoriesData } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const categories = categoriesData ? ["All", ...categoriesData.map((c: any) => c.name)] : ["All"];

  const { data, isLoading } = useListArticles(
    {
      category: category !== "All" ? category : undefined,
      search: appliedSearch || undefined,
      limit: PAGE_SIZE,
    } as any,
    {
      query: {
        queryKey: getListArticlesQueryKey({
          category: category !== "All" ? category : undefined,
          search: appliedSearch || undefined,
        } as any),
      }
    }
  );

  // When initial data arrives set allArticles
  useEffect(() => {
    if (data && cursor === null) {
      setAllArticles((data as any)?.articles ?? []);
      setHasMore(!!(data as any)?.nextCursor);
    }
  }, [data, cursor]);

  const articlesToShow = cursor === null ? ((data as any)?.articles ?? []) : allArticles;
  const total = (data as any)?.total ?? 0;

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    const lastId = articlesToShow[articlesToShow.length - 1]?.id;
    if (!lastId) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (category !== "All") params.set("category", category);
      if (appliedSearch) params.set("search", appliedSearch);
      params.set("limit", String(PAGE_SIZE));
      params.set("cursor", String(lastId));
      const r = await fetch(`/api/articles?${params.toString()}`);
      const d = await r.json();
      const newArticles = d.articles ?? [];
      const merged = [...allArticles, ...newArticles];
      setAllArticles(merged);
      setCursor(lastId);
      setHasMore(!!d.nextCursor && newArticles.length >= PAGE_SIZE);
    } catch {}
    finally { setLoadingMore(false); }
  }

  const clearFilters = () => {
    setSearch(""); setAppliedSearch(""); setCategory("All");
    setCursor(null); setAllArticles([]); setHasMore(true);
    navigate("/articles", { replace: true });
  };

  return (
    <div className="w-full bg-background pt-12 pb-24">
      <Helmet>
        <title>Essays – The Verdant Page</title>
        <meta name="description" content="All essays and articles about the natural world — ecology, wildlife, conservation, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Essays – The Verdant Page" />
        <meta property="og:description" content="All essays and articles about the natural world — ecology, wildlife, conservation, and more." />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Essays – The Verdant Page" />
        <meta name="twitter:description" content="All essays and articles about the natural world — ecology, wildlife, conservation, and more." />
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-tight">Essays & Field Notes</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            An archive of dispatches from the natural world. From deep dives into complex ecosystems to personal reflections on our relationship with the wild.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center justify-between bg-card p-6 border border-border">
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {categories.map((cat: string) => {
              const catData = categoriesData?.find((c: any) => c.name === cat);
              return (
                <button key={cat} onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border flex items-center gap-2 ${
                    category === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}>
                  {catData?.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catData.color }} />}
                  {cat}
                </button>
              );
            })}
          </div>
          <form onSubmit={handleSearch} className="relative w-full lg:w-[300px] flex">
            <Input type="search" placeholder="Search articles..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 bg-background rounded-r-none h-11" />
            <Button type="submit" variant="default" className="rounded-l-none h-11 px-4">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Results count */}
        <div className="mb-8">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span>
                Showing {articlesToShow.length} of {total} {category !== "All" ? `articles in ${category}` : "articles"}
                {appliedSearch && ` matching "${appliedSearch}"`}
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col space-y-4">
                <Skeleton className="aspect-[3/2] w-full rounded-none" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-20 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : articlesToShow.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articlesToShow.map((article: any, index: number) => (
                <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.08 }} className="h-full">
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </div>

            {hasMore && articlesToShow.length < total && (
              <div className="flex justify-center mt-16">
                <button onClick={loadMore} disabled={loadingMore}
                  className="inline-flex items-center gap-2 border border-border px-8 py-3 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60">
                  {loadingMore
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</>
                    : <>Load more articles ({total - articlesToShow.length} remaining)</>}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-32 bg-muted/20 border border-dashed border-border flex flex-col items-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-6 opacity-40" />
            <h3 className="font-serif text-3xl text-foreground mb-3">No articles found</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We couldn't find any articles matching your search criteria.
            </p>
            {(appliedSearch || category !== "All") && (
              <Button variant="outline" className="mt-8" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
