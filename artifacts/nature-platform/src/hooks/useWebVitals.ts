import { useEffect } from "react";

type MetricName = "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";

interface Metric {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
}

function sendVital(metric: Metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    page: window.location.pathname,
  };
  // Use sendBeacon for reliability
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/vitals", blob);
  } else {
    fetch("/api/analytics/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  }
}

export function useWebVitals() {
  useEffect(() => {
    // Use the web-vitals library if available, otherwise use PerformanceObserver
    import("web-vitals")
      .then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
        onCLS(sendVital as any);
        onFCP(sendVital as any);
        onINP(sendVital as any);
        onLCP(sendVital as any);
        onTTFB(sendVital as any);
      })
      .catch(() => {
        // web-vitals not available — skip
      });
  }, []);
}
