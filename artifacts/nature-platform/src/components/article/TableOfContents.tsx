import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function useHeadings(content: string): Heading[] {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const regex = /^(#{1,3})\s+(.+)$/gm;
    const found: Heading[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugify(text);
      found.push({ id, text, level });
    }
    setHeadings(found);
  }, [content]);

  return headings;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="hidden xl:block sticky top-24 w-56 shrink-0 self-start">
      <div className="border-l border-border pl-4">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Contents
        </p>
        <ul className="space-y-2">
          {headings.map(({ id, text, level }) => (
            <li key={id} style={{ paddingLeft: `${(level - 1) * 12}px` }}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`block text-sm leading-snug transition-colors hover:text-primary ${
                  activeId === id
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
