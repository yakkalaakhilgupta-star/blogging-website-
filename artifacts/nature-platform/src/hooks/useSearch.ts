import { useState, useEffect, useRef } from "react";

export interface SearchArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  imageUrl?: string | null;
}

export interface SearchSpecies {
  id: number;
  slug: string;
  commonName: string;
  scientificName: string;
  kingdom: string;
  conservationStatus: string;
  imageUrl?: string | null;
}

export interface SearchResults {
  articles: SearchArticle[];
  species: SearchSpecies[];
}

export function useSearch(query: string, debounceMs = 220) {
  const [results, setResults] = useState<SearchResults>({ articles: [], species: [] });
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setResults({ articles: [], species: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const [artRes, spRes] = await Promise.all([
          fetch(`/api/articles?search=${encodeURIComponent(q)}&limit=5&status=published`, {
            signal: controller.signal,
          }),
          fetch(`/api/species?search=${encodeURIComponent(q)}`, {
            signal: controller.signal,
          }),
        ]);

        const artData = artRes.ok ? await artRes.json() : { articles: [] };
        const spData = spRes.ok ? await spRes.json() : [];

        setResults({
          articles: (artData.articles ?? []).slice(0, 5),
          species: (Array.isArray(spData) ? spData : []).slice(0, 4),
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setResults({ articles: [], species: [] });
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, debounceMs]);

  return { results, loading };
}
