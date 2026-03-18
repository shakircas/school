"use client";

import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { SmartRenderer } from "@/components/ai/SmartRenderer";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  Search,
  Database,
  Download,
  ChevronDown,
  Table as TableIcon,
  MicOff,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --- Sub-Component: Data Preview Table ---
// Optimized for mobile with horizontal scrolling and sticky headers
function DataPreview({ data, title }) {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]).filter((key) => key !== "_id");

  const exportToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "SchoolData");
      XLSX.writeFile(workbook, `${title}_${new Date().getTime()}.xlsx`);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <div className="mt-4 border rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="bg-slate-50 px-3 py-2 border-b flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <TableIcon size={14} className="text-slate-500" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest truncate max-w-[120px]">
            {title}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToExcel}
          className="h-7 text-[10px] gap-1 px-2 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
        >
          <Download size={12} /> Export
        </Button>
      </div>
      <div className="overflow-x-auto max-w-full">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-left text-[11px] border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="p-3 border-b font-bold text-slate-700 capitalize whitespace-nowrap bg-slate-50/50"
                  >
                    {col.replace(/([A-Z])/g, " $1")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="p-3 text-slate-600 whitespace-nowrap border-r last:border-0 border-slate-100"
                    >
                      {typeof row[col] === "object" ? "Data" : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function AISchoolBrain() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeLang, setActiveLang] = useState("en-US");

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // 1. Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, loading]);

  // 2. Auto-resize textarea for better mobile UX
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [question]);

  // 3. Voice logic with error handling
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = activeLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      askAI(transcript);
    };

    recognition.start();
  };

  const suggestedPrompts = [
    "Top scorer in Class 10th?",
    "Average attendance Section B",
    "Students with pending fees",
    "Monthly performance summary",
  ];

  async function askAI(directQuestion = null) {
    const query = directQuestion || question;
    if (!query.trim()) return;

    setLoading(true);
    setQuestion("");

    const userMsg = { role: "user", text: query };
    setChatHistory((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.answer || "No response received.",
          rawData: data.records || [],
          collection: data.collection || "Database",
        },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Failed to connect to School Brain server." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-5xl mx-auto bg-white sm:bg-slate-50 sm:h-[90vh] sm:my-5 sm:rounded-2xl border shadow-2xl overflow-hidden transition-all">
      {/* Header - Sticky & Responsive */}
      <header className="bg-white border-b px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg sm:rounded-xl shadow-lg">
            <Bot className="text-white h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 truncate">
              School Brain AI
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[8px] sm:text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100"
              >
                Live DB
              </Badge>
              <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                <Sparkles className="h-3 w-3 text-amber-400" /> Gemini 3 Flash
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setChatHistory([])}
          className="h-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
        >
          <RotateCcw className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline text-xs font-bold">Reset</span>
        </Button>
      </header>

      {/* Chat Area - Scrollable */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30 scroll-smooth"
      >
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-xl border border-slate-100 max-w-sm animate-in fade-in zoom-in duration-500">
              <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-indigo-500" />
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                Portal Insight
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Query attendance, results, or finance data in real-time using
                voice or text.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => askAI(p)}
                  className="text-left p-3 sm:p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all text-xs font-semibold text-slate-600"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}
          >
            <div
              className={`flex gap-3 max-w-[95%] sm:max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  msg.role === "user"
                    ? "bg-slate-200 text-slate-700"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`p-4 rounded-2xl shadow-sm border text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-white rounded-tr-none text-slate-700"
                    : "bg-white rounded-tl-none text-slate-800"
                }`}
              >
                <SmartRenderer content={msg.text} />

                {msg.role === "ai" && msg.rawData?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <details className="group">
                      <summary className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 cursor-pointer list-none">
                        <Database size={12} /> INSPECT RECORDS
                        <ChevronDown
                          size={12}
                          className="group-open:rotate-180 transition-transform ml-auto"
                        />
                      </summary>
                      <DataPreview data={msg.rawData} title={msg.collection} />
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 w-[85%] sm:w-[60%]">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                <Bot size={16} className="text-white" />
              </div>
              <div className="space-y-2 w-full bg-white p-4 rounded-2xl border shadow-sm">
                <Skeleton className="h-3 w-full bg-slate-100" />
                <Skeleton className="h-3 w-[70%] bg-slate-100" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input Footer - Responsive with Auto-expand */}
      <footer className="bg-white border-t p-3 sm:p-5">
        <div className="max-w-4xl mx-auto flex items-end gap-2 sm:gap-4">
          <div className="relative flex-1 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-[1.75rem] focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all overflow-hidden">
            <textarea
              ref={textareaRef}
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  askAI();
                }
              }}
              className="w-full bg-transparent pl-4 pr-24 py-3 sm:py-4 text-sm sm:text-base outline-none resize-none min-h-[48px] max-h-[120px] scrollbar-hide"
              placeholder="Query the school ledger..."
            />

            {/* Language & Voice Controls */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1 sm:gap-2">
              <div className="flex bg-white/80 backdrop-blur border border-slate-200 p-0.5 rounded-lg shadow-sm">
                <button
                  onClick={() => setActiveLang("en-US")}
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all ${
                    activeLang === "en-US"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setActiveLang("ur-PK")}
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all ${
                    activeLang === "ur-PK"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400"
                  }`}
                >
                  اردو
                </button>
              </div>

              <button
                type="button"
                onClick={startListening}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? "bg-red-500 text-white shadow-red-200 shadow-lg animate-pulse"
                    : "text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                }`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
          </div>

          <Button
            onClick={() => askAI()}
            disabled={loading || !question.trim()}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 shrink-0 transition-transform active:scale-90"
          >
            <Send className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
