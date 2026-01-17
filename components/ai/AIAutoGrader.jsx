"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Camera,
  Upload,
  Award,
  RefreshCw,
  FileText,
  LayoutGrid,
  Printer,
  Trash2,
  Download,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { BubbleSheet } from "./BubbleSheet";

// --- SUB-COMPONENT: Grade Slip for PDF Export ---
const GradeSlip = ({ result, markingType }) => (
  <div className="p-10 border-[12px] border-double border-slate-900 bg-white min-h-[500px] font-sans">
    <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          Result Certificate
        </h1>
        <p className="text-sm font-bold text-slate-500 italic">
          EduForge AI Assessment System • 2026
        </p>
      </div>
      <div className="text-right">
        <p className="font-black text-xl">{new Date().toLocaleDateString()}</p>
        <p className="text-xs font-bold uppercase bg-slate-900 text-white px-2 py-1 mt-1">
          Official Record
        </p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-8 mb-10 text-lg">
      <p className="border-b-2 border-slate-100 pb-2">
        Student:{" "}
        <span className="font-black underline">{result?.studentName}</span>
      </p>
      <p className="border-b-2 border-slate-100 pb-2">
        Roll No: <span className="font-black underline">{result?.rollNo}</span>
      </p>
      <p className="border-b-2 border-slate-100 pb-2">
        Mode: <span className="font-black uppercase">{markingType}</span>
      </p>
      <p className="border-b-2 border-slate-100 pb-2">
        Code: <span className="font-black">{result?.paperCode || "N/A"}</span>
      </p>
    </div>
    <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-200 text-center mb-8">
      <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
        Final Score
      </p>
      <div className="text-7xl font-black text-slate-900">
        {result?.score || result?.totalMarks}{" "}
        <span className="text-3xl text-slate-300">
          / {result?.total || 100}
        </span>
      </div>
    </div>
    <p className="text-slate-600 italic font-medium text-center px-10 mb-10">
      "{result?.feedback || "Satisfactory performance across all sections."}"
    </p>
    <div className="flex justify-between mt-20">
      <div className="w-48 border-t-2 border-slate-900 pt-2 text-center text-xs font-black uppercase">
        Examiner Signature
      </div>
      <div className="w-48 border-t-2 border-slate-900 pt-2 text-center text-xs font-black uppercase">
        Institution Seal
      </div>
    </div>
  </div>
);

export function AIAutoGrader() {
  const [answerKey, setAnswerKey] = useState("");
  const [markingType, setMarkingType] = useState("bubble");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [grading, setGrading] = useState(false);
  const [printMode, setPrintMode] = useState("blank");
  const [batch, setBatch] = useState([]);

  // Load batch from local storage
  useEffect(() => {
    const saved = localStorage.getItem("grading_batch");
    if (saved) setBatch(JSON.parse(saved));
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  };

  const startGrading = async () => {
    if (!image || !answerKey) return toast.error("Provide image and key!");
    setGrading(true);
    try {
      const res = await fetch("/api/ai/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, answerKey, type: markingType }),
      });
      const data = await res.json();
      setResult(data);
      const updatedBatch = [data, ...batch];
      setBatch(updatedBatch);
      localStorage.setItem("grading_batch", JSON.stringify(updatedBatch));
      toast.success("Grading Complete!");
    } catch (err) {
      toast.error("Grading failed.");
    } finally {
      setGrading(false);
    }
  };

  const handlePrintResult = () => {
    setPrintMode("result");
    setTimeout(() => {
      window.print();
      setPrintMode("blank");
    }, 150);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm print:hidden">
        <div>
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-2 text-slate-900">
            <TrendingUp className="text-indigo-600" /> AI Grader Pro
          </h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
            KPK Board Vision Engine v2.6
          </p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: "bubble", label: "OMR Bubble", icon: LayoutGrid },
            { id: "paper", label: "Handwritten", icon: FileText },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setMarkingType(t.id)}
              className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                markingType === t.id
                  ? "bg-white shadow-md text-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <t.icon className="w-4 h-4 mr-2" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: INPUTS (4 Cols) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          <Card className="p-6 rounded-[2rem] border-2 border-slate-100 shadow-none bg-white">
            <label className="text-[10px] font-black uppercase text-indigo-500 mb-3 block tracking-[0.2em]">
              Step 1: Paste Marking Scheme
            </label>
            <textarea
              className="w-full h-40 p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Paste solution manual here..."
              value={answerKey}
              onChange={(e) => setAnswerKey(e.target.value)}
            />
          </Card>

          <Card className="border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 flex flex-col items-center justify-center p-8 min-h-[350px]">
            {!image ? (
              <div className="text-center group">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-10 h-10 text-indigo-500" />
                </div>
                <p className="font-black text-slate-800 mb-6">
                  Drop Student Sheet Here
                </p>
                <input
                  type="file"
                  onChange={handleUpload}
                  className="hidden"
                  id="upload"
                  accept="image/*"
                />
                <label htmlFor="upload">
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-2xl px-8 h-12 cursor-pointer bg-white font-bold border-2 hover:bg-slate-900 hover:text-white transition-colors"
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" /> Upload JPEG
                    </span>
                  </Button>
                </label>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src={`data:image/jpeg;base64,${image}`}
                    className="w-full h-64 object-cover"
                    alt="Preview"
                  />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-full shadow-lg hover:rotate-90 transition-transform"
                  >
                    ✕
                  </button>
                </div>
                <Button
                  onClick={startGrading}
                  disabled={grading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-16 rounded-[1.5rem] text-lg font-black shadow-xl shadow-indigo-200 uppercase tracking-wider"
                >
                  {grading ? (
                    <RefreshCw className="animate-spin mr-3" />
                  ) : (
                    <Award className="mr-3" />
                  )}
                  {grading ? "AI Analyzing..." : "Grade This Sheet"}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT: RESULTS & BATCH (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <Card className="rounded-[2.5rem] border-4 border-emerald-500 bg-emerald-50/10 p-8 shadow-2xl relative overflow-hidden print:hidden">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">
                    Result Generated
                  </h3>
                  <p className="text-3xl font-black text-slate-900">
                    {result.studentName}
                  </p>
                  <p className="text-sm font-bold text-slate-400 mt-1 uppercase">
                    Roll: {result.rollNo} • Code: {result.paperCode}
                  </p>
                </div>
                <div className="bg-emerald-500 text-white px-6 py-4 rounded-[2rem] text-center shadow-lg shadow-emerald-200">
                  <p className="text-[10px] font-black uppercase mb-1 opacity-80">
                    Total Score
                  </p>
                  <p className="text-3xl font-black leading-none">
                    {result.score || result.totalMarks}
                    <span className="text-sm opacity-60">/{result.total}</span>
                  </p>
                </div>
              </div>
              <Button
                onClick={handlePrintResult}
                className="w-full mt-8 bg-slate-900 text-white h-14 rounded-2xl font-black uppercase tracking-tighter hover:bg-indigo-600 transition-colors"
              >
                <Printer className="mr-2" /> Generate Individual PDF Slip
              </Button>
            </Card>
          )}

          {/* SESSION BATCH HISTORY */}
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 print:hidden shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">
                Session Batch{" "}
                <span className="text-indigo-600 ml-2">({batch.length})</span>
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBatch([]);
                    localStorage.clear();
                  }}
                  className="rounded-xl font-bold text-rose-500 border-rose-100 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Clear Session
                </Button>
              </div>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {batch.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-bold">
                  No students graded in this session yet.
                </div>
              ) : (
                batch.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center font-black text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">
                          {item.studentName}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
                          ROLL: {item.rollNo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-indigo-600">
                        {item.score || item.totalMarks}/{item.total}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTION */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
        <div className="text-white text-center md:text-left">
          <h3 className="text-2xl font-black">Prepare for Examination</h3>
          <p className="text-indigo-100 font-medium opacity-80">
            Download blank OMR sheets optimized for this AI engine.
          </p>
        </div>
        <Button
          onClick={() => {
            setPrintMode("blank");
            setTimeout(() => window.print(), 100);
          }}
          variant="secondary"
          className="rounded-2xl h-14 px-10 font-black uppercase bg-white text-indigo-600 shadow-xl hover:scale-105 transition-transform"
        >
          Print Blank Sheets
        </Button>
      </div>

      {/* PRINT AREA (Hidden on Screen) */}
      <div className="hidden print:block">
        {printMode === "blank" ? (
          <BubbleSheet count={45} />
        ) : (
          <GradeSlip result={result} markingType={markingType} />
        )}
      </div>
    </div>
  );
}
