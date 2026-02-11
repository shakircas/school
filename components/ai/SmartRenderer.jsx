import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export function SmartRenderer({ content, language }) {
  const isUrdu = language === "Urdu";

  return (
    <div
      dir={isUrdu ? "rtl" : "ltr"}
      className={`prose max-w-none ${isUrdu ? "font-urdu text-right" : "text-left"}`}
    >
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
