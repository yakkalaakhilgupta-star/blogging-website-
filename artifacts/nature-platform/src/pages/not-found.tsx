import { Link } from "wouter";
import { Leaf, ArrowLeft, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | The Verdant Page</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full min-h-[85vh] flex items-center justify-center bg-background px-4">
        <div className="max-w-lg w-full text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="text-[120px] font-serif font-bold text-primary/10 leading-none select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Leaf className="h-10 w-10 text-primary" />
                </div>
              </div>
            </div>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Lost in the wilderness
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            The page you're looking for seems to have wandered off the trail.
            Perhaps it's been moved, deleted, or never existed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="h-12 px-8 w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/articles">
              <Button variant="outline" className="h-12 px-8 w-full sm:w-auto">
                <BookOpen className="h-4 w-4 mr-2" />
                Read Articles
              </Button>
            </Link>
            <Link href="/species">
              <Button variant="outline" className="h-12 px-8 w-full sm:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Browse Species
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
