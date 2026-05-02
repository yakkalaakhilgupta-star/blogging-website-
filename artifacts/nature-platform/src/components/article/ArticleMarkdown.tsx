import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface ArticleMarkdownProps {
  content: string;
  fontSize?: number;
}

export function ArticleMarkdown({ content, fontSize = 18 }: ArticleMarkdownProps) {
  const isMarkdown = content.includes("##") || content.includes("**") || content.includes("- ") || content.includes("[");

  if (!isMarkdown) {
    return (
      <div
        className="whitespace-pre-wrap font-sans text-foreground/90 leading-relaxed"
        style={{ fontSize: `${fontSize}px` }}
      >
        {content}
      </div>
    );
  }

  return (
    <div style={{ fontSize: `${fontSize}px` }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => {
            const text = String(children);
            return <h1 id={slugify(text)} className="font-serif text-4xl font-bold mt-10 mb-4 text-foreground scroll-mt-24">{children}</h1>;
          },
          h2: ({ children }) => {
            const text = String(children);
            return <h2 id={slugify(text)} className="font-serif text-3xl font-bold mt-10 mb-4 text-foreground scroll-mt-24">{children}</h2>;
          },
          h3: ({ children }) => {
            const text = String(children);
            return <h3 id={slugify(text)} className="font-serif text-2xl font-semibold mt-8 mb-3 text-foreground scroll-mt-24">{children}</h3>;
          },
          p: ({ children }) => (
            <p className="leading-relaxed mb-6 text-foreground/90">{children}</p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-6 my-8 italic text-muted-foreground">{children}</blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-6 space-y-2 text-foreground/90">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-6 space-y-2 text-foreground/90">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">{children}</a>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block bg-muted p-4 rounded-sm text-sm font-mono overflow-x-auto my-6 text-foreground">{children}</code>
              );
            }
            return (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-muted rounded-sm overflow-x-auto my-6">{children}</pre>
          ),
          img: ({ src, alt }) => (
            <img src={src} alt={alt || ""} loading="lazy" className="w-full my-8 rounded-none" />
          ),
          hr: () => (
            <hr className="border-border my-12" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
