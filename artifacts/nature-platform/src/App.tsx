import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import { usePageAnalytics } from "@/hooks/usePageAnalytics";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { SearchContext } from "@/lib/searchContext";

// Pages
import Home from "@/pages/Home";
import Articles from "@/pages/Articles";
import ArticleReader from "@/pages/ArticleReader";
import Species from "@/pages/Species";
import SpeciesProfile from "@/pages/SpeciesProfile";
import Portfolio from "@/pages/Portfolio";
import Services from "@/pages/Services";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Newsletter from "@/pages/Newsletter";
import TagPage from "@/pages/TagPage";
import Unsubscribe from "@/pages/Unsubscribe";
import AdminMessages from "@/pages/AdminMessages";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2,
    },
  },
});

function Router() {
  usePageAnalytics();
  return (
    <Layout>
      <ErrorBoundary>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/articles" component={Articles} />
          <Route path="/articles/:slug" component={ArticleReader} />
          <Route path="/species" component={Species} />
          <Route path="/species/:slug" component={SpeciesProfile} />
          <Route path="/tags/:slug" component={TagPage} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/services" component={Services} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/newsletter" component={Newsletter} />
          <Route path="/unsubscribe" component={Unsubscribe} />
          <Route path="/admin/messages" component={AdminMessages} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route component={NotFound} />
        </Switch>
      </ErrorBoundary>
    </Layout>
  );
}

function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        open: searchOpen,
        openSearch: () => setSearchOpen(true),
        closeSearch: () => setSearchOpen(false),
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </SearchContext.Provider>
  );
}

export default App;
