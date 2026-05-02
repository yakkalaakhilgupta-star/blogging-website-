import { useState, useCallback } from "react";

const KEY = "verdant_bookmarks";

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(slugs: string[]) {
  localStorage.setItem(KEY, JSON.stringify(slugs));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => load());

  const addBookmark = useCallback((slug: string) => {
    setBookmarks((prev) => {
      if (prev.includes(slug)) return prev;
      const next = [slug, ...prev];
      save(next);
      return next;
    });
  }, []);

  const removeBookmark = useCallback((slug: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((s) => s !== slug);
      save(next);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((slug: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [slug, ...prev];
      save(next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback((slug: string) => bookmarks.includes(slug), [bookmarks]);

  return { bookmarks, addBookmark, removeBookmark, toggleBookmark, isBookmarked };
}
