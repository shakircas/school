"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import ReactMarkdown from "react-markdown"; // Recommended for professional output
import { SmartRenderer } from "../ai/SmartRenderer";

export default function AIExplanationPanel({
  classId,
  classData,
  subjectSummary,
}) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");

 

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/risk/ai-analysis", {
        // Using the robust route we built earlier
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classData,
          subjectSummary,
          className: "Current Selection",
        }),
      });
      const data = await res.json();
      setAnalysis(data.report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg- text-black p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">
              AI Diagnostic Report
            </h2>
            <p className="text-slate-400 font-medium">
              Neural analysis of current class performance and risk vectors.
            </p>
          </div>
          <button
            onClick={generateAnalysis}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="animate-spin" />
            ) : (
              "Generate Intelligence"
            )}
          </button>
        </div>

        {/* {analysis && (
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-slate-200 prose prose-invert max-w-none">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        )} */}
        {analysis && (
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-slate-200 prose prose-invert max-w-none">
            <SmartRenderer content={analysis}  />
          </div>
        )}
      </div>
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[120px] -mr-32 -mt-32" />
    </div>
  );
}
