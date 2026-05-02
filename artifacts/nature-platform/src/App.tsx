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
import ReadingList from "@/pages/ReadingList";
import NewsletterConfirmed from "@/pages/NewsletterConfirmed";
import { useWebVitals } from "@/hooks/useWebVitals";

// Admin pages
import AdminArticles from "@/pages/admin/AdminArticles";
import AdminArticleEdit from "@/pages/admin/AdminArticleEdit";
import AdminSpecies from "@/pages/admin/AdminSpecies";
import AdminSpeciesEdit from "@/pages/admin/AdminSpeciesEdit";
import AdminPortfolio from "@/pages/admin/AdminPortfolio";
import AdminTags from "@/pages/admin/AdminTags";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminNewsletter from "@/pages/admin/AdminNewsletter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2,
    },
  },
});

// Admin routes rendered outside Layout (have their own layout)
function AdminRouter() {
  usePageAnalytics();
  useWebVitals();
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/admin/articles" component={AdminArticles} />
        <Route path="/admin/articles/new" component={AdminArticleEdit} />
        <Route path="/admin/articles/:slug/edit" component={AdminArticleEdit} />
        <Route path="/admin/species" component={AdminSpecies} />
        <Route path="/admin/species/new" component={AdminSpeciesEdit} />
        <Route path="/admin/species/:slug/edit" component={AdminSpeciesEdit} />
        <Route path="/admin/portfolio" component={AdminPortfolio} />
        <Route path="/admin/tags" component={AdminTags} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/newsletter" component={AdminNewsletter} />
        <Route path="/admin/messages" component={AdminMessages} />
      </Switch>
    </ErrorBoundary>
  );
}

function PublicRouter() {
  usePageAnalytics();
  useWebVitals();
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
          <Route path="/newsletter/confirmed" component={NewsletterConfirmed} />
          <Route path="/unsubscribe" component={Unsubscribe} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/reading-list" component={ReadingList} />
          <Route component={NotFound} />
        </Switch>
      </ErrorBoundary>
    </Layout>
  );
}

function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [location, setLocation] = useState(window.location.pathname);

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

  const isAdminPath = location.startsWith("/admin");

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
          <WouterRouter
            base={import.meta.env.BASE_URL.replace(/\/$/, "")}
            onChange={setLocation}
          >
            {isAdminPath ? <AdminRouter /> : <PublicRouter />}
          </WouterRouter>
          <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </SearchContext.Provider>
  );
}

export default App;
