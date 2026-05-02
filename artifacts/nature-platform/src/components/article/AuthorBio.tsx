import { Link } from "wouter";
import { Rss, Mail } from "lucide-react";

export function AuthorBio() {
  return (
    <div className="mt-16 pt-10 border-t border-border">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Avatar */}
        <div className="shrink-0 w-20 h-20 bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="font-serif text-2xl text-primary font-bold">TVP</span>
        </div>

        {/* Bio */}
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Written by</p>
          <h3 className="font-serif text-2xl text-foreground mb-3">The Verdant Page</h3>
          <p className="text-muted-foreground leading-relaxed text-sm max-w-prose">
            Nature writing at the intersection of science and story. Field dispatches, species portraits, and long-form essays from the wild edges of our planet — written for anyone who believes the natural world deserves both rigorous attention and lyrical prose.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Link href="/articles" className="text-xs font-medium uppercase tracking-wider text-primary hover:text-accent transition-colors flex items-center gap-1.5">
              All Essays
            </Link>
            <a href="/feed.xml" className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <Rss className="h-3 w-3" />
              RSS Feed
            </a>
            <Link href="/newsletter" className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              Newsletter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
