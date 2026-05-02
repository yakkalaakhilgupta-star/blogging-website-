import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const article = document.getElementById("article-content");
      if (!article) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
        return;
      }
      const rect = article.getBoundingClientRect();
      const articleTop = window.scrollY + rect.top;
      const articleHeight = article.offsetHeight;
      const scrolled = window.scrollY - articleTop;
      const pct = Math.min(100, Math.max(0, (scrolled / (articleHeight - window.innerHeight)) * 100));
      setProgress(pct);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
      <div
        className="h-full bg-primary transition-all duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
