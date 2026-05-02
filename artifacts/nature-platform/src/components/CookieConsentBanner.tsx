import { useState, useEffect } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "verdant_cookie_consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-foreground text-background border-t border-background/10 px-4 py-4 md:py-3">
      <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-5xl">
        <p className="text-sm leading-relaxed text-background/80 flex-1">
          We use browser localStorage to save your reading preferences (no tracking cookies).{" "}
          <a href="/privacy" className="underline text-background hover:text-primary-foreground">
            Privacy Policy
          </a>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="text-xs text-background/60 hover:text-background px-3 py-1.5 border border-background/20 hover:border-background/40 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-xs bg-primary text-primary-foreground px-4 py-1.5 font-semibold hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
          <button onClick={decline} className="p-1 text-background/50 hover:text-background ml-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
