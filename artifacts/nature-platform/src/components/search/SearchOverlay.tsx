import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Search, X, BookOpen, Leaf, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useSearch, type SearchArticle, type SearchSpecies } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

type ResultItem =
  | { kind: "article"; data: SearchArticle }
  | { kind: "species"; data: SearchSpecies };

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const { results, loading } = useSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursor, setCursor] = useState(-1);
  const [, navigate] = useLocation();

  const allItems: ResultItem[] = [
    ...results.articles.map((a) => ({ kind: "article" as const, data: a })),
    ...results.species.map((s) => ({ kind: "species" as const, data: s })),
  ];

  const hasResults = allItems.length > 0;
  const showEmpty = query.trim().length >= 2 && !loading && !hasResults;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setCursor(-1);
    }
  }, [open]);

  useEffect(() => {
    setCursor(-1);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, allItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, -1));
      } else if (e.key === "Enter" && cursor >= 0) {
        e.preventDefault();
        const item = allItems[cursor];
        if (!item) return;
        const href = item.kind === "article"
          ? `/articles/${item.data.slug}`
          : `/species/${item.data.slug}`;
        navigate(href);
        onClose();
      }
    },
    [allItems, cursor, navigate, onClose]
  );

  const handleSelect = useCallback(
    (item: ResultItem) => {
      const href = item.kind === "article"
        ? `/articles/${item.data.slug}`
        : `/species/${item.data.slug}`;
      navigate(href);
      onClose();
    },
    [navigate, onClose]
  );

  if (!open) return null;

  let globalIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl bg-card border border-border shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {loading
            ? <Loader2 className="h-5 w-5 text-muted-foreground shrink-0 animate-spin" />
            : <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles and species…"
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border px-1.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {query.trim().length < 2 && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            Type at least 2 characters to search…
          </div>
        )}

        {showEmpty && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No results for <strong>"{query}"</strong>
          </div>
        )}

        {hasResults && (
          <div className="max-h-[60vh] overflow-y-auto">
            {results.articles.length > 0 && (
              <section>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/40">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Articles
                  </span>
                </div>
                {results.articles.map((article) => {
                  const idx = globalIdx++;
                  const active = cursor === idx;
                  return (
                    <button
                      key={article.id}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 last:border-0",
                        active ? "bg-primary/8" : "hover:bg-muted/50"
                      )}
                      onMouseEnter={() => setCursor(idx)}
                      onClick={() => handleSelect({ kind: "article", data: article })}
                    >
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt=""
                          loading="lazy"
                          className="h-10 w-10 shrink-0 object-cover bg-muted"
                        />
                      ) : (
                        <div className="h-10 w-10 shrink-0 bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-primary/60" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{article.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{article.excerpt}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">{article.category}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />{article.readTime}m
                        </span>
                      </div>
                      {active && <ArrowRight className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </section>
            )}

            {results.species.length > 0 && (
              <section>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/40">
                  <Leaf className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Species
                  </span>
                </div>
                {results.species.map((species) => {
                  const idx = globalIdx++;
                  const active = cursor === idx;
                  return (
                    <button
                      key={species.id}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 last:border-0",
                        active ? "bg-primary/8" : "hover:bg-muted/50"
                      )}
                      onMouseEnter={() => setCursor(idx)}
                      onClick={() => handleSelect({ kind: "species", data: species })}
                    >
                      {species.imageUrl ? (
                        <img
                          src={species.imageUrl}
                          alt=""
                          loading="lazy"
                          className="h-10 w-10 shrink-0 object-cover bg-muted"
                        />
                      ) : (
                        <div className="h-10 w-10 shrink-0 bg-primary/10 flex items-center justify-center">
                          <Leaf className="h-4 w-4 text-primary/60" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{species.commonName}</p>
                        <p className="text-xs text-muted-foreground italic line-clamp-1 mt-0.5">{species.scientificName}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">{species.kingdom}</span>
                        <span className="text-xs text-muted-foreground">{species.conservationStatus}</span>
                      </div>
                      {active && <ArrowRight className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </section>
            )}
          </div>
        )}

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-4 items-center rounded border border-border px-1 font-mono text-[10px]">↑</kbd>
            <kbd className="inline-flex h-4 items-center rounded border border-border px-1 font-mono text-[10px]">↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-4 items-center rounded border border-border px-1 font-mono text-[10px]">↵</kbd>
            open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-4 items-center rounded border border-border px-1 font-mono text-[10px]">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
