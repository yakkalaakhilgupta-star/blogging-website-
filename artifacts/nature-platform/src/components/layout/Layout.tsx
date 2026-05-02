import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Helmet>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Verdant Page – RSS Feed"
          href="/api/feed.xml"
        />
      </Helmet>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsentBanner />
      </div>
    </>
  );
}
