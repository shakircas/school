// "use client";
// import ReactMarkdown from "react-markdown";
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";
// import "katex/dist/katex.min.css";

// export function SmartRenderer({ content, language }) {
//   const isUrdu = language === "Urdu";

//   return (
//     <div
//       dir={isUrdu ? "rtl" : "ltr"}
//       className={`prose max-w-none ${isUrdu ? "font-urdu text-right" : "text-left"}`}
//     >
//       <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
//         {content}
//       </ReactMarkdown>
//     </div>
//   );
// }

"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw"; // Allows rendering of HTML if needed
import "katex/dist/katex.min.css";

/**
 * Modern Markdown Renderer for Next.js 15+
 * Optimized for BISE Mardan Mathematics & Science papers.
 */
export function SmartRenderer({ content, language }) {
  const isUrdu = language === "Urdu";

  // If content is an array (from your API), join it.
  const processedContent = Array.isArray(content)
    ? content.join("\n")
    : content;

  return (
    <div
      dir={isUrdu ? "rtl" : "ltr"}
      className={`
        prose prose-slate max-w-none
        /* Base Text Styling */
        ${isUrdu ? "font-urdu text-right leading-[2.5] text-2xl" : "text-left leading-relaxed text-slate-800"}
        
        /* Heading Fixes */
        prose-headings:font-black prose-headings:tracking-tight
        
        /* Math Alignment: Ensure KaTeX stays LTR even in Urdu mode */
        [&_.katex-display]:my-4
        [&_.katex]:direction-ltr [&_.katex]:inline-block
        
        /* Table Styling for Math Distributions */
        prose-table:border-2 prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:p-2 prose-td:p-2
        
        /* Remove default quotes from blockquotes in prose */
        prose-blockquote:not-italic prose-blockquote:font-medium
      `}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          rehypeRaw, // Use cautiously: safe if content comes from your own AI API
        ]}
        components={{
          // Customizing how specific elements look for a "Paper" feel
          h2: ({ node, ...props }) => (
            <h2
              className="border-b-2 border-slate-900 pb-2 mb-4 mt-8 uppercase text-xl"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                className="min-w-full border-collapse border border-slate-300"
                {...props}
              />
            </div>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}