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
  Info,
  Download,
  ChevronDown,
  Table as TableIcon,
  MicOff,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --- Sub-Component: Data Preview Table ---
function DataPreview({ data, title }) {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]).filter((key) => key !== "_id");

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SchoolData");
    XLSX.writeFile(
      workbook,
      `${title}_export_${new Date().toLocaleDateString()}.xlsx`,
    );
  };

  return (
    <div className="mt-4 border rounded-xl overflow-hidden bg-slate-50 shadow-inner">
      <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TableIcon size={14} className="text-slate-500" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Source: {title}
          </span>
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={exportToExcel}
          className="h-7 text-[10px] gap-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
        >
          <Download size={12} /> Export Excel
        </Button>
      </div>
      <div className="max-h-72 overflow-auto">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="p-3 border-b font-bold text-slate-700 capitalize whitespace-nowrap"
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
                    {typeof row[col] === "object" ? (
                      <Badge
                        variant="outline"
                        className="text-[9px] font-normal"
                      >
                        Object Data
                      </Badge>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function AISchoolBrain() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // --- Voice Recognition Logic ---
  const [isListening, setIsListening] = useState(false);

  // const startListening = () => {
  //   const SpeechRecognition =
  //     window.SpeechRecognition || window.webkitSpeechRecognition;
  //   if (!SpeechRecognition) {
  //     alert("Voice recognition is not supported in this browser.");
  //     return;
  //   }

  //   const recognition = new SpeechRecognition();
  //   recognition.lang = "en-US"; // Change to "ur-PK" for Urdu support

  //   recognition.onstart = () => setIsListening(true);
  //   recognition.onend = () => setIsListening(false);

  //   recognition.onresult = (event) => {
  //     const transcript = event.results[0][0].transcript;
  //     setQuestion(transcript);
  //     askAI(transcript); // Automatically trigger the search
  //   };

  //   recognition.start();
  // };


  const [activeLang, setActiveLang] = useState("en-US"); // Default to English

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    // Dynamically set based on teacher's choice
    recognition.lang = activeLang;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      askAI(transcript);
    };

    recognition.start();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const suggestedPrompts = [
    "Who is the top scorer in Class 10th?",
    "Calculate average attendance for Section B",
    "List students with pending fees",
    "Summarize school performance this month",
  ];

  async function askAI(directQuestion = null) {
    const query = directQuestion || question;
    if (!query.trim()) return;

    setLoading(true);
    setQuestion("");

    // Optimistically add user message
    const userMsg = { role: "user", text: query };
    setChatHistory((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      const data = await res.json();

      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.answer || "I couldn't retrieve that data right now.",
          rawData: data.records || [], // Captured from Python execute_query
          collection: data.collection || "Database",
          mode: data.mode,
        },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Error: Failed to connect to the School Brain server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex mt-10 mb-10 flex-col max-w-5xl mx-auto bg-slate-50 rounded-2xl border shadow-xl overflow-hidden">
      {/* 1. Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-200 shadow-lg">
            <Bot className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              School Brain AI
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                Live DB Access
              </Badge>
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                <Sparkles className="h-3 w-3 text-amber-400" /> Powered by
                Gemini 3 Flash
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setChatHistory([])}
          className="text-slate-500 hover:text-red-500"
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Reset
        </Button>
      </header>

      {/* 2. Chat Area */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
      >
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-100 max-w-md animate-in fade-in zoom-in duration-500">
              <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="h-10 w-10 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Principal's Intelligence Portal
              </h2>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                Ask questions about results, attendance, or teacher profiles.
                Data is pulled in real-time from the school ledger.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => askAI(p)}
                  className="text-left p-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-white hover:shadow-md transition-all text-sm font-semibold text-slate-700"
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
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`flex gap-4 max-w-[90%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg
                ${msg.role === "user" ? "bg text-black" : "bg-indigo-600 text-white"}`}
              >
                {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div
                className={`p-5 rounded-3xl shadow-sm border
                ${msg.role === "user" ? "bg text-black rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none"}`}
              >
                <SmartRenderer content={msg.text} />

                {/* Data Table Section */}
                {msg.role === "ai" && msg.rawData?.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <details className="group">
                      <summary className="flex items-center gap-2 text-xs font-bold text-indigo-600 cursor-pointer hover:text-indigo-800 transition-all list-none">
                        <div className="bg-indigo-50 p-1.5 rounded-lg">
                          <Database size={14} />
                        </div>
                        <span>INSPECT RAW RECORDS</span>
                        <ChevronDown
                          size={14}
                          className="ml-auto group-open:rotate-180 transition-transform"
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
            <div className="flex gap-4 w-[70%]">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
                <Bot size={20} className="text-white animate-bounce" />
              </div>
              <div className="space-y-3 w-full bg-white p-5 rounded-3xl border">
                <Skeleton className="h-4 w-full bg-slate-100" />
                <Skeleton className="h-4 w-[85%] bg-slate-100" />
                <Skeleton className="h-4 w-[40%] bg-slate-100" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Input */}
      <footer className="bg-white border-t p-6">
        <div className="relative max-w-4xl mx-auto flex items-end gap-3">
          <div className="relative flex-1">
            <div className="absolute left-5 bottom-5 text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <textarea
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), askAI())
              }
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] pl-14 pr-4 py-5 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all resize-none min-h-[64px] font-medium"
              placeholder="Query the school ledger..."
            />

            {/* VOICE BUTTON */}
            {/* <button
              type="button"
              onClick={startListening}
              className={`absolute right-4 bottom-4 p-2 rounded-xl transition-all ${
                isListening
                  ? "bg-red-100 text-red-600 animate-pulse"
                  : "text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button> */}

            {/* Language Toggle + Voice Button Container */}
            <div className="absolute right-4 bottom-4 flex items-center gap-2">
              <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setActiveLang("en-US")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                    activeLang === "en-US"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  ENG
                </button>
                <button
                  onClick={() => setActiveLang("ur-PK")}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                    activeLang === "ur-PK"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500"
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
                    ? "bg-red-500 text-white animate-pulse"
                    : "text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
          </div>
          <Button
            onClick={() => askAI()}
            disabled={loading || !question.trim()}
            className="h-[64px] w-[64px] rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-xl shrink-0 transition-transform active:scale-95"
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
