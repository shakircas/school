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
import "katex/dist/katex.min.css";

export function SmartRenderer({ content, language }) {
  const isUrdu = language === "Urdu";

  return (
    <div
      dir={isUrdu ? "rtl" : "ltr"}
      className={`
        prose max-w-none 
        ${isUrdu ? "font-urdu text-right leading-[2.8] text-2xl" : "text-left leading-relaxed"}
        /* KaTeX rendering adjustments for Urdu context */
        [&_.katex]:font-sans [&_.katex]:direction-ltr
      `}
    >
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}