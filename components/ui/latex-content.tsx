"use client";

import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/lib/utils";

/**
 * Renders Markdown with inline ($...$) and display ($$...$$) maths via KaTeX.
 * Used both for the live preview in the assignment dialog and for displaying
 * a LaTeX-bodied assignment on the detail pages.
 */
export function LatexContent({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // Plain typographic styling consistent with the app (no prose plugin).
        "text-base leading-relaxed text-foreground",
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:first:mt-0",
        "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-5 [&_h2]:mb-2",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2",
        "[&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
        "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-1 [&_li]:pl-1",
        "[&_strong]:font-semibold [&_em]:italic",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        "[&_code]:rounded [&_code]:bg-bg-subtle [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.875em] [&_code]:font-mono",
        "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-bg-muted [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border-subtle [&_blockquote]:pl-4 [&_blockquote]:text-content-subtle",
        "[&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
