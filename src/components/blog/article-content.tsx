import ReactMarkdown from "react-markdown";
import { CodeCopyListener } from "./code-copy-button";
import { CodeBlock } from "./code-block";
import { ZoomableImage } from "./zoomable-image";

interface ArticleContentProps {
  content: string;
}

type ContentType = "editorjs-json" | "blocknote-json" | "html" | "markdown";

function detectContentType(content: string): ContentType {
  const trimmed = content.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.blocks)) {
        return "editorjs-json";
      }
    } catch {}
  }
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return "blocknote-json";
    } catch {}
  }
  if (trimmed.startsWith("<")) return "html";
  return "markdown";
}

export function ArticleContent({ content }: ArticleContentProps) {
  const contentType = detectContentType(content);

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-img:rounded-xl prose-headings:scroll-mt-20 text-foreground leading-relaxed">
      <CodeCopyListener />

      {contentType === "editorjs-json" && (
        <EditorJsRenderer content={content} />
      )}

      {contentType === "blocknote-json" && (
        <LegacyBlockNoteRenderer content={content} />
      )}

      {contentType === "html" && (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      )}

      {contentType === "markdown" && (
        <MarkdownContent content={content} />
      )}
    </div>
  );
}

// ==========================================
// 🎨 Editor.js Block Renderer
// ==========================================
function EditorJsRenderer({ content }: { content: string }) {
  try {
    const data = JSON.parse(content);
    const blocks: any[] = data.blocks || [];

    return (
      <div className="space-y-4">
        {blocks.map((block) => {
          const id = block.id || Math.random().toString(36).substring(2, 9);

          switch (block.type) {
            case "header": {
              const level = block.data.level || 2;
              const text = block.data.text || "";
              if (level === 1) return <h1 key={id} className="text-3xl font-extrabold tracking-tight mt-8 mb-4 border-b pb-2" dangerouslySetInnerHTML={{ __html: text }} />;
              if (level === 3) return <h3 key={id} className="text-xl font-semibold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: text }} />;
              if (level === 4) return <h4 key={id} className="text-lg font-semibold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: text }} />;
              return <h2 key={id} className="text-2xl font-bold tracking-tight mt-6 mb-3" dangerouslySetInnerHTML={{ __html: text }} />;
            }

            case "paragraph":
              return (
                <p
                  key={id}
                  className="text-foreground text-base leading-7 mb-4"
                  dangerouslySetInnerHTML={{ __html: block.data.text || "" }}
                />
              );

            case "list": {
              const isOrdered = block.data.style === "ordered";
              const items: any[] = block.data.items || [];
              const ListTag = isOrdered ? "ol" : "ul";
              const listClass = isOrdered
                ? "list-decimal pl-6 mb-4 text-foreground space-y-1"
                : "list-disc pl-6 mb-4 text-foreground space-y-1";

              return (
                <ListTag key={id} className={listClass}>
                  {items.map((item, idx) => {
                    const itemText = typeof item === "string" ? item : item.content || "";
                    return (
                      <li key={idx} className="pl-1" dangerouslySetInnerHTML={{ __html: itemText }} />
                    );
                  })}
                </ListTag>
              );
            }

            case "code":
              return (
                <CodeBlock
                  key={id}
                  code={block.data.code || ""}
                  language={block.data.language || "code"}
                />
              );

            case "image": {
              const url = block.data.file?.url || block.data.url;
              const caption = block.data.caption;
              const withBorder = !!block.data.withBorder;
              const withBackground = !!block.data.withBackground;
              const stretched = !!block.data.stretched;
              if (!url) return null;

              return (
                <ZoomableImage
                  key={id}
                  src={url}
                  alt={caption || "Makale Görseli"}
                  caption={caption}
                  withBorder={withBorder}
                  withBackground={withBackground}
                  stretched={stretched}
                />
              );
            }

            case "quote":
              return (
                <blockquote
                  key={id}
                  className="border-l-4 border-primary/80 pl-4 py-2 my-4 italic text-muted-foreground bg-muted/30 rounded-r-md"
                >
                  <p dangerouslySetInnerHTML={{ __html: block.data.text || "" }} />
                  {block.data.caption && (
                    <cite className="block text-xs font-semibold not-italic mt-1 text-foreground">
                      — {block.data.caption}
                    </cite>
                  )}
                </blockquote>
              );

            case "delimiter":
              return <hr key={id} className="my-8 border-border" />;

            case "table": {
              const content2D: string[][] = block.data.content || [];
              const withHeadings = block.data.withHeadings;

              if (!content2D.length) return null;

              const headerRow = withHeadings ? content2D[0] : null;
              const bodyRows = withHeadings ? content2D.slice(1) : content2D;

              return (
                <div key={id} className="my-6 overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[13px] !m-0 !p-0">
                      {headerRow && (
                        <thead className="bg-muted/40 dark:bg-zinc-800/50 border-b border-border/70 select-none">
                          <tr>
                            {headerRow.map((cell, cIdx) => (
                              <th
                                key={cIdx}
                                className="border-r border-border/50 px-3.5 py-2.5 text-xs font-semibold text-muted-foreground dark:text-zinc-300 last:border-r-0 whitespace-nowrap"
                                dangerouslySetInnerHTML={{ __html: cell }}
                              />
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody className="divide-y divide-border/40 text-foreground">
                        {bodyRows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="border-r border-border/40 px-3.5 py-2.5 text-foreground/90 font-normal leading-snug last:border-r-0 align-top break-words"
                                dangerouslySetInnerHTML={{ __html: cell || "" }}
                              />
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            case "checklist": {
              const items: any[] = block.data.items || [];
              return (
                <div key={id} className="space-y-2 my-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!item.checked}
                        readOnly
                        className="rounded border-border accent-primary cursor-default"
                      />
                      <span
                        className={item.checked ? "line-through text-muted-foreground" : "text-foreground"}
                        dangerouslySetInnerHTML={{ __html: item.text || "" }}
                      />
                    </div>
                  ))}
                </div>
              );
            }

            default:
              return null;
          }
        })}
      </div>
    );
  } catch (err) {
    console.error("Editor.js rendering error:", err);
    return <p className="text-destructive">İçerik işlenirken hata oluştu.</p>;
  }
}

// ==========================================
// 🎓 Legacy BlockNote JSON Renderer
// ==========================================
function LegacyBlockNoteRenderer({ content }: { content: string }) {
  try {
    const blocks: any[] = JSON.parse(content);
    return (
      <div className="space-y-4">
        {blocks.map((block, idx) => {
          let text = "";
          if (Array.isArray(block.content)) {
            text = block.content.map((c: any) => c.text || "").join("");
          }

          if (block.type === "heading") {
            const level = block.props?.level || 2;
            if (level === 1) return <h1 key={idx} className="text-3xl font-extrabold tracking-tight mt-8 mb-4 border-b pb-2">{text}</h1>;
            return <h2 key={idx} className="text-2xl font-bold tracking-tight mt-6 mb-3">{text}</h2>;
          }

          if (block.type === "codeBlock") {
            return (
              <CodeBlock
                key={idx}
                code={text}
                language={block.props?.language || "code"}
              />
            );
          }

          return <p key={idx} className="text-foreground leading-7 mb-4">{text}</p>;
        })}
      </div>
    );
  } catch {
    return <p>Eski içerik yüklenemedi.</p>;
  }
}

// ==========================================
// 🎓 Markdown Renderer Component
// ==========================================
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => <h1 className="text-3xl font-extrabold tracking-tight mt-8 mb-4 border-b pb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-2xl font-bold tracking-tight mt-6 mb-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
        h4: ({ node, ...props }) => <h4 className="text-lg font-semibold mt-4 mb-2" {...props} />,
        p: ({ node, ...props }) => <p className="text-foreground text-base leading-7 mb-4" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 text-foreground space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 text-foreground space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-primary/60 pl-4 py-2 italic text-muted-foreground bg-muted/30 rounded-r-md mb-4" {...props} />
        ),
        pre: ({ node, children, ...props }) => <>{children}</>,
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          const codeString = Array.isArray(children)
            ? children.join("")
            : String(children || "").replace(/\n$/, "");

          if (match || codeString.includes("\n")) {
            return <CodeBlock code={codeString} language={match ? match[1] : "code"} />;
          }

          return (
            <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono text-foreground" {...props}>
              {children}
            </code>
          );
        },
        img: ({ node, ...props }) => (
          <ZoomableImage
            src={String(props.src || "")}
            alt={props.alt}
            caption={props.alt}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
