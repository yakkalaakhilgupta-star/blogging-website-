import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { CheckCircle, XCircle, Loader2, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unsubscribe() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const email = params.get("email");
  const token = params.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle");

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const body: Record<string, string> = {};
      if (email) body.email = email;
      if (token) body.token = token;

      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (email || token) {
      handleUnsubscribe();
    }
  }, []);

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
        </div>

        {status === "idle" && (
          <>
            <h1 className="font-serif text-3xl font-bold mb-4">Unsubscribe</h1>
            <p className="text-muted-foreground mb-8">
              Are you sure you want to unsubscribe from The Verdant Page newsletter?
              You'll miss our latest nature writing and field notes.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleUnsubscribe} variant="destructive" className="h-12">
                Yes, unsubscribe me
              </Button>
              <Link href="/">
                <Button variant="outline" className="h-12 w-full">
                  No, keep me subscribed
                </Button>
              </Link>
            </div>
          </>
        )}

        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold mb-2">Processing...</h1>
            <p className="text-muted-foreground">Updating your subscription preferences.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="font-serif text-3xl font-bold mb-4">You've been unsubscribed</h1>
            <p className="text-muted-foreground mb-8">
              You will no longer receive emails from The Verdant Page. 
              We're sorry to see you go — you're always welcome back.
            </p>
            <Link href="/newsletter">
              <Button variant="outline" className="h-12">
                Re-subscribe anytime
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="font-serif text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-8">
              We couldn't process your unsubscribe request. Please try again or 
              contact us directly at hello@verdantpage.com.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleUnsubscribe} className="h-12">
                Try Again
              </Button>
              <Link href="/">
                <Button variant="outline" className="h-12 w-full">
                  Go to Homepage
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
