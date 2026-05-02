import { Link, useLocation } from "wouter";
import { Leaf, Menu, X, Search, Bookmark } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSearchContext } from "@/lib/searchContext";
import { useBookmarks } from "@/hooks/useBookmarks";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openSearch } = useSearchContext();
  const { bookmarks } = useBookmarks();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Articles", href: "/articles" },
    { name: "Species", href: "/species" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-bold text-foreground">The Verdant Page</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-2",
                  location === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
                {location === link.href && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={openSearch}
              className="flex items-center gap-2 h-8 px-3 text-sm text-muted-foreground border border-border/60 bg-muted/40 hover:bg-muted hover:text-foreground transition-colors rounded-sm"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search</span>
              <kbd className="inline-flex h-4 items-center gap-0.5 rounded border border-border px-1 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </button>
            <Link href="/reading-list">
              <span className="relative p-2 text-muted-foreground hover:text-foreground transition-colors inline-block cursor-pointer" title="Reading list">
                <Bookmark className="h-4 w-4" />
                {bookmarks.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {bookmarks.length > 9 ? "9+" : bookmarks.length}
                  </span>
                )}
              </span>
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-1 md:hidden">
            <button onClick={openSearch} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/reading-list">
              <span className="relative p-2 text-muted-foreground hover:text-foreground inline-block cursor-pointer">
                <Bookmark className="h-5 w-5" />
                {bookmarks.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {bookmarks.length > 9 ? "9+" : bookmarks.length}
                  </span>
                )}
              </span>
            </Link>
            <button
              className="p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
