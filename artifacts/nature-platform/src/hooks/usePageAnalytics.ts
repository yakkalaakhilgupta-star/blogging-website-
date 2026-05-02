import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

function trackPageView(path: string) {
  fetch("/api/analytics/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, referrer: document.referrer || null }),
  }).catch(() => {});
}

export function usePageAnalytics() {
  const [location] = useLocation();
  const lastLocation = useRef<string | null>(null);

  useEffect(() => {
    if (location !== lastLocation.current) {
      lastLocation.current = location;
      trackPageView(location);
    }
  }, [location]);
}
