"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
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
  Settings,
  Volume2,
  VolumeX,
  X,
  FileText,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --- Sub-Component: Dynamic Result Chart ---
function ResultChart({ data }) {
  // Extract numerical keys for the Y-Axis (e.g., "marks", "percentage", "total")
  const sample = data[0] || {};
  const dataKey =
    Object.keys(sample).find(
      (k) =>
        typeof sample[k] === "number" ||
        (!isNaN(parseFloat(sample[k])) && k.toLowerCase().includes("mark")),
    ) || "value";

  const nameKey =
    Object.keys(sample).find(
      (k) =>
        k.toLowerCase().includes("name") ||
        k.toLowerCase().includes("student") ||
        k.toLowerCase().includes("subject"),
    ) || Object.keys(sample)[0];

  return (
    <div className="h-[250px] w-full mt-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
        <BarChart3 size={12} /> Performance Visualization
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey={nameKey}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b" }}
          />
          <YAxis
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            }}
            cursor={{ fill: "#f8fafc" }}
          />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index % 2 === 0 ? "#4f46e5" : "#10b981"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Sub-Component: Data Preview Table ---
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
          className="h-7 text-[10px] gap-1 px-2 hover:bg-emerald-50"
        >
          <Download size={12} /> Export
        </Button>
      </div>
      <div className="overflow-x-auto max-w-full">
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
  );
}

// --- Main Component ---
export default function AISchoolBrain() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeLang, setActiveLang] = useState("en-US");

  // Voice & Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceRate, setVoiceRate] = useState(1);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setAvailableVoices(v);
      if (v.length > 0 && !selectedVoice) setSelectedVoice(v[0].name);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [question]);

  // PDF Export Logic
  const exportPDF = (msg) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("School Brain AI - Data Summary", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Query: ${msg.userQuery || "General Query"}`, 14, 28);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 33);

    doc.setFontSize(12);
    doc.setTextColor(0);
    const splitText = doc.splitTextToSize(msg.text, 180);
    doc.text(splitText, 14, 45);

    if (msg.rawData?.length > 0) {
      const headers = Object.keys(msg.rawData[0]).filter((k) => k !== "_id");
      const rows = msg.rawData.map((r) => headers.map((h) => String(r[h])));
      doc.autoTable({
        startY: 55 + splitText.length * 5,
        head: [headers.map((h) => h.toUpperCase())],
        body: rows,
        theme: "striped",
        headStyles: { fillStyle: [79, 70, 229] },
      });
    }
    doc.save(`School_Report_${Date.now()}.pdf`);
  };

  const speak = (text) => {
    if (isMuted || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, ""));
    const voice = availableVoices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = voiceRate;
    utterance.lang = activeLang;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = activeLang;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setQuestion(t);
      askAI(t);
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
    setChatHistory((prev) => [...prev, { role: "user", text: query }]);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });
      const data = await res.json();
      const aiMsg = {
        role: "ai",
        text: data.answer || "No response received.",
        rawData: data.records || [],
        collection: data.collection || "Database",
        userQuery: query,
      };
      setChatHistory((prev) => [...prev, aiMsg]);
      // speak(aiMsg.text);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Server connection failed." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-5xl mx-auto bg-white sm:bg-slate-50 sm:h-[90vh] sm:my-5 sm:rounded-2xl border shadow-2xl overflow-hidden relative">
      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Settings size={18} /> Voice Settings
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
              >
                <X size={20} />
              </Button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">
                  Voice Choice
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-xl text-xs"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">
                  Reading Speed ({voiceRate}x)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(e.target.value)}
                  className="w-full accent-indigo-600"
                />
              </div>
              <Button
                className="w-full bg-indigo-600 rounded-xl"
                onClick={() => setShowSettings(false)}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg sm:rounded-xl shadow-lg">
            <Bot className="text-white h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h1 className="text-sm sm:text-lg font-black text-slate-900 truncate">
            School Brain AI
          </h1>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className={isMuted ? "text-red-400" : "text-slate-400"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="text-slate-400"
          >
            <Settings size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setChatHistory([])}
            className="text-slate-400 hover:text-red-500"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Chat */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30"
      >
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-xl border border-slate-100 max-w-sm">
              <Database className="h-8 w-8 text-indigo-500 mx-auto mb-4" />
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                Portal Insight
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Query attendance or results in real-time.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => askAI(p)}
                  className="text-left p-3 sm:p-4 bg-white border rounded-xl hover:border-indigo-400 transition-all text-xs font-semibold text-slate-600"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-3 max-w-[95%] sm:max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${msg.role === "user" ? "bg-slate-200" : "bg-indigo-600 text-white"}`}
                >
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="p-4 rounded-2xl shadow-sm border text-sm bg-white">
                  <SmartRenderer content={msg.text} />

                  {msg.role === "ai" && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-3">
                      {/* New Manual Narrate Button */}
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => speak(msg.text)}
                        className="w-fit h-7 text-[10px] gap-1.5 text-slate-600"
                      >
                        <Volume2 size={12} /> Narrate Response
                      </Button>

                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => exportPDF(msg)}
                        className="w-fit h-7 text-[10px] gap-1.5 text-indigo-600"
                      >
                        <FileText size={12} /> Download PDF Summary
                      </Button>

                      {msg.rawData?.length > 1 && (
                        <ResultChart data={msg.rawData} />
                      )}

                      {msg.rawData?.length > 0 && (
                        <details className="group">
                          <summary className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 cursor-pointer list-none">
                            <Database size={12} /> INSPECT RECORDS
                            <ChevronDown
                              size={12}
                              className="group-open:rotate-180 transition-transform ml-auto"
                            />
                          </summary>
                          <DataPreview
                            data={msg.rawData}
                            title={msg.collection}
                          />
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <Skeleton className="h-20 w-3/4 rounded-2xl mx-auto sm:mx-0" />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t p-3 sm:p-5">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          <div className="relative flex-1 bg-slate-50 border rounded-2xl overflow-hidden focus-within:border-indigo-300 transition-all">
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
              className="w-full bg-transparent pl-4 pr-24 py-3 sm:py-4 text-sm outline-none resize-none min-h-[48px] max-h-[120px]"
              placeholder="Query the school ledger..."
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <div className="flex bg-white/80 p-0.5 rounded-lg border shadow-sm">
                <button
                  onClick={() => setActiveLang("en-US")}
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${activeLang === "en-US" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setActiveLang("ur-PK")}
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${activeLang === "ur-PK" ? "bg-emerald-600 text-white" : "text-slate-400"}`}
                >
                  اردو
                </button>
              </div>
              <button
                onClick={startListening}
                className={`p-2 rounded-xl ${isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:text-indigo-600"}`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
          </div>
          <Button
            onClick={() => askAI()}
            disabled={loading || !question.trim()}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
