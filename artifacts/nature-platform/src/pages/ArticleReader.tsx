import { useParams, Link } from "wouter";
import { useGetArticle, getGetArticleQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ArrowLeft, Clock, Calendar, Tag, Twitter, Linkedin, Link as LinkIcon, Eye, Bookmark, BookmarkCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { ReadingProgressBar } from "@/components/article/ReadingProgressBar";
import { TableOfContents, useHeadings } from "@/components/article/TableOfContents";
import { ArticleMarkdown } from "@/components/article/ArticleMarkdown";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { useBookmarks } from "@/hooks/useBookmarks";
import { AuthorBio } from "@/components/article/AuthorBio";
import { CommentsSection } from "@/components/article/CommentsSection";
import { SeriesNav } from "@/components/article/SeriesNav";

export default function ArticleReader() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const { toast } = useToast();
  const [fontSize, setFontSize] = useState(18);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const { data: article, isLoading, error } = useGetArticle(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetArticleQueryKey(slug)
    }
  });

  const headings = useHeadings(article?.content ?? "");

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied", description: "Article link copied to clipboard." });
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: article?.title, url: window.location.href });
    } else {
      copyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background pt-12 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Skeleton className="h-4 w-24 mb-8" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-3/4 mb-8" />
          <div className="flex gap-4 mb-12">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="aspect-[21/9] w-full mb-12 rounded-none" />
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="font-serif text-4xl font-bold mb-4">Article not found</h1>
          <p className="text-muted-foreground mb-8">The essay you're looking for doesn't exist or has been moved.</p>
          <Link href="/articles"><Button variant="default">Back to all articles</Button></Link>
        </div>
      </div>
    );
  }

  const publishedDate = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt);
  const modifiedDate = article.updatedAt ? new Date(article.updatedAt) : publishedDate;
  const pageTitle = article.seoTitle || article.title;
  const pageDesc = article.seoDescription || article.excerpt;
  const canonicalUrl = `${window.location.origin}/articles/${article.slug}`;

  return (
    <>
      <Helmet>
        <title>{pageTitle} | The Verdant Page</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={article.imageUrl || `${window.location.origin}/opengraph.jpg`} />
        <meta property="article:published_time" content={publishedDate.toISOString()} />
        <meta property="article:modified_time" content={modifiedDate.toISOString()} />
        <meta property="article:section" content={article.category} />
        <meta property="article:author" content="The Verdant Page" />
        {article.tags?.map((t) => (
          <meta key={t.slug} property="article:tag" content={t.name} />
        ))}
        <meta name="author" content="The Verdant Page" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={article.imageUrl || `${window.location.origin}/opengraph.jpg`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": article.title,
          "description": pageDesc,
          "image": article.imageUrl || undefined,
          "url": canonicalUrl,
          "datePublished": publishedDate.toISOString(),
          "dateModified": modifiedDate.toISOString(),
          "author": {
            "@type": "Person",
            "name": "The Verdant Page"
          },
          "publisher": {
            "@type": "Organization",
            "name": "The Verdant Page",
            "logo": {
              "@type": "ImageObject",
              "url": `${window.location.origin}/favicon.svg`
            }
          },
          "articleSection": article.category,
          "timeRequired": `PT${article.readTime}M`,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "The Verdant Page",
              "item": window.location.origin
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Essays",
              "item": `${window.location.origin}/articles`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": article.title,
              "item": canonicalUrl
            }
          ]
        })}</script>
      </Helmet>

      <ReadingProgressBar />

      <article className="w-full bg-background pt-12 pb-32" id="article-content">
        {/* Header */}
        <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="mb-8">
            <Link href="/articles" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to articles
            </Link>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-foreground mb-6">
            {article.title}
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8 font-serif italic">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-y-4 gap-x-8 py-6 border-y border-border text-sm font-medium text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              {format(publishedDate, "MMMM d, yyyy")}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              {article.readTime} min read
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2 text-primary" />
              {(article.viewCount || 0).toLocaleString()} views
            </div>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-primary" />
              <span className="uppercase tracking-wider text-xs">{article.category}</span>
            </div>
            {/* Font size controls + bookmark */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs uppercase tracking-wider">Text:</span>
              <button
                onClick={() => setFontSize(s => Math.max(14, s - 2))}
                className="h-7 w-7 flex items-center justify-center border border-border hover:bg-muted text-sm font-bold"
                title="Decrease font size"
              >A-</button>
              <button
                onClick={() => setFontSize(s => Math.min(26, s + 2))}
                className="h-7 w-7 flex items-center justify-center border border-border hover:bg-muted text-base font-bold"
                title="Increase font size"
              >A+</button>
              <button
                onClick={() => {
                  toggleBookmark(article.slug);
                  toast({
                    title: isBookmarked(article.slug) ? "Removed from reading list" : "Saved to reading list",
                    description: isBookmarked(article.slug) ? undefined : "Find it in your reading list.",
                  });
                }}
                className={`h-7 w-7 flex items-center justify-center border hover:bg-muted transition-colors ml-1 ${
                  isBookmarked(article.slug) ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground"
                }`}
                title={isBookmarked(article.slug) ? "Remove bookmark" : "Save to reading list"}
              >
                {isBookmarked(article.slug)
                  ? <BookmarkCheck className="h-3.5 w-3.5" />
                  : <Bookmark className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="aspect-[21/9] w-full overflow-hidden bg-muted relative">
              <img
                src={article.imageUrl}
                alt={article.imageAlt || article.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Content + Sidebars */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-12 relative">
          {/* Share Sidebar (Desktop) */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-32 h-fit w-12 shrink-0">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 rotate-180" style={{ writingMode: 'vertical-rl' }}>Share</div>
            <div className="w-[1px] h-12 bg-border mx-auto mb-2" />
            <button onClick={copyLink} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy Link">
              <LinkIcon className="h-5 w-5" />
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-[#1DA1F2] transition-colors"
              title="Share on X (Twitter)"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-[#0A66C2] transition-colors"
              title="Share on LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-[#1877F2] transition-colors"
              title="Share on Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(article.title + " " + window.location.href)}`}
              target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-[#25D366] transition-colors"
              title="Share on WhatsApp"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.847L0 24l6.335-1.662A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.306-1.563l-.378-.228-3.928 1.031 1.05-3.836-.246-.394A9.818 9.818 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" /></svg>
            </a>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="prose prose-lg dark:prose-invert max-w-none w-full">
              <ArticleMarkdown content={article.content} fontSize={fontSize} />
            </div>

            {/* Tags */}
            {(article as any).tags && (article as any).tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {(article as any).tags.map((tag: any) => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`}>
                      <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground cursor-pointer text-xs uppercase tracking-wider px-3 py-1">
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Species cross-link */}
            {(article as any).speciesId && (
              <div className="mt-8 p-6 bg-primary/5 border border-primary/20">
                <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Featured Species</p>
                <Link href={`/species/${(article as any).speciesSlug}`}>
                  <span className="font-serif text-xl hover:text-primary transition-colors">
                    Meet the {(article as any).speciesName} →
                  </span>
                </Link>
              </div>
            )}

            {/* Series Navigation */}
            {(article as any).seriesId && (
              <SeriesNav
                articleSlug={article.slug}
                seriesId={(article as any).seriesId}
                seriesTitle={(article as any).seriesTitle}
                seriesSlug={(article as any).seriesSlug}
              />
            )}

            {/* Author Bio */}
            <AuthorBio />

            {/* Related Articles */}
            <RelatedArticles currentSlug={article.slug} category={article.category} />

            {/* Comments */}
            <CommentsSection articleSlug={article.slug} />

            {/* Mobile Share */}
            <div className="mt-16 pt-8 border-t border-border lg:hidden">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Share:</span>
                <button onClick={shareNative} className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
                  <LinkIcon className="h-4 w-4" />
                </button>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(article.title + " " + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.847L0 24l6.335-1.662A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.306-1.563l-.378-.228-3.928 1.031 1.05-3.836-.246-.394A9.818 9.818 0 0 1 2.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z" /></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Table of Contents (far right) */}
          <TableOfContents headings={headings} />
        </div>
      </article>
    </>
  );
}
