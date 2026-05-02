import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function NewsletterConfirmed() {
  const [location] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    fetch(`/api/newsletter/confirm?token=${encodeURIComponent(token)}`)
      .then((r) => setStatus(r.ok ? "success" : "error"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Subscription Confirmed | The Verdant Page</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
              <p className="text-muted-foreground">Confirming your subscription…</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-14 w-14 text-primary mx-auto mb-6" />
              <h1 className="font-serif text-3xl font-bold mb-4">You're confirmed!</h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Your subscription to The Verdant Page is active. Watch your inbox for new essays and field notes from the natural world.
              </p>
              <Link href="/articles">
                <span className="inline-block bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
                  Read the Latest →
                </span>
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-14 w-14 text-destructive mx-auto mb-6" />
              <h1 className="font-serif text-3xl font-bold mb-4">Link expired or invalid</h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                This confirmation link is invalid or has already been used. Subscribe again to receive a new link.
              </p>
              <Link href="/newsletter">
                <span className="inline-block bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90">
                  Subscribe Again
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
