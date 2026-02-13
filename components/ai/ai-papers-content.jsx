// "use client";

// import { useState, useRef } from "react";
// import { useForm } from "react-hook-form";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import {
//   Wand2,
//   Download,
//   Printer,
//   FileText,
//   Copy,
//   Settings2,
//   Sparkles,
//   BookOpen,
//   Target,
//   BrainCircuit,
//   Languages,
// } from "lucide-react";
// import { toast } from "sonner";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { SolutionManual } from "./SolutionManual";
// import { subjectsKPK } from "@/lib/constants";
// import { exportToWord } from "@/lib/export-word";
// import { Switch } from "../ui/switch";
// import { Checkbox } from "../ui/checkbox";
// import { SmartRenderer } from "./SmartRenderer";

// export function AIPapersContent() {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedPaper, setGeneratedPaper] = useState(null);
//   const [selectedChapters, setSelectedChapters] = useState([]);
//   const paperRef = useRef(null);

//   const { register, handleSubmit, setValue, watch } = useForm({
//     defaultValues: {
//       class: "9",
//       subject: "Physics",
//       examType: "Final Term",
//       totalMarks: "65",
//       duration: "3 Hours",
//       cognitiveLevel: "Balanced (SLO Based)",
//       difficulty: "Standard Board Level",
//       sections: "All Sections (A, B, C)",
//       chapterRange: "Full Book",
//       language: "English",
//     },
//   });

//   const selectedSubjectValue = watch("subject");
//   const isUrduMode = watch("language") === "Urdu";

//   // Find chapters for the current subject
//   const currentSubjectData = subjectsKPK.find(
//     (s) => s.value === selectedSubjectValue,
//   );
//   const availableChapters = currentSubjectData?.chapters || [];

//   const handleChapterToggle = (chapter) => {
//     const updated = selectedChapters.includes(chapter)
//       ? selectedChapters.filter((c) => c !== chapter)
//       : [...selectedChapters, chapter];
//     setSelectedChapters(updated);
//     setValue(
//       "chapterRange",
//       updated.length > 0 ? updated.join(", ") : "Full Book",
//     );
//   };

//   const onSubmit = async (data) => {
//     setIsGenerating(true);
//     try {
//       const response = await fetch("/api/ai/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: "exam-paper",
//           ...data,
//         }),
//       });

//       if (response.status === 429) {
//         toast.error(
//           "Google's free limit reached. Please wait a minute before trying again!",
//         );
//         return;
//       }

//       const result = await response.json();
//       if (result.paper) {
//         setGeneratedPaper(result.paper);
//         toast.success("BISE Standard Paper Generated!");
//       }
//     } catch (error) {
//       toast.error("Generation failed. Check your API connection.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   console.log(generatedPaper);
//   // const DownloadWord = async () => {
//   //   console.log("submitting");
//   //   try {
//   //     await exportToWord(generatedPaper);
//   //     toast.success("Word document generated!");
//   //   } catch (err) {
//   //     toast.error("Word export failed.");
//   //   }
//   // };

//   const handleDownloadWord = async () => {
//     console.log("submitting");

//     try {
//       // Ensure content is an array of lines
//       const contentLines = Array.isArray(generatedPaper.content)
//         ? generatedPaper.content
//         : generatedPaper.content.split("\n").filter(Boolean);

//       const body = {
//         title: generatedPaper.title,
//         content: contentLines,
//         subject: generatedPaper.subject,
//         class: generatedPaper.class,
//         duration: generatedPaper.duration,
//         language: generatedPaper.language,
//       };

//       const res = await fetch("/api/export-word", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       if (!res.ok) throw new Error("Server error while generating Word");

//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${body.subject}_${body.class}_${body.language}.docx`;
//       a.click();
//       window.URL.revokeObjectURL(url);

//       toast.success("Word document generated!");
//     } catch (err) {
//       console.error(err);
//       toast.error("Word export failed.");
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-2 md:p-2 space-y-2 print:p-0">
//       {/* Header Area */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
//         <div>
//           <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
//             <Sparkles className="text-indigo-600 w-8 h-8" />
//             Paper Architect{" "}
//             <span className="text-indigo-600 text-sm bg-indigo-50 px-3 py-1 rounded-full ml-2">
//               PRO v2.5
//             </span>
//           </h1>
//           <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] mt-1">
//             BISE Mardan Standardized Paper Generator
//           </p>
//         </div>

//         {generatedPaper && (
//           <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
//             <Button
//               variant="outline"
//               onClick={() => window.print()}
//               className="rounded-xl font-black border-2 border-slate-200"
//             >
//               <Printer className="w-4 h-4 mr-2" /> Print
//             </Button>
//             {/* Updated Download Button */}
//             <Button
//               onClick={handleDownloadWord}
//               className="bg-slate-900 rounded-xl font-black px-6 shadow-xl gap-2"
//             >
//               <FileText className="w-4 h-4" /> Download Word (.docx)
//             </Button>
//             {/* <Button
//               onClick={DownloadWord}
//               className="bg- rounded-xl ml-2 font-black px-6 shadow-xl gap-2"
//             >
//               <FileText className="w-4 h-4" /> Download Word (.docx)
//             </Button> */}
//           </div>
//         )}
//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
//         {/* Left Control Panel: High Density Settings */}
//         <Card className="xl:col-span-4 border-2 border-slate-100 shadow-2xl rounded-[2rem] overflow-hidden print:hidden">
//           <div className="bg p-2 text-black flex items-center gap-3">
//             <Settings2 className="w-5 h-5 text-indigo-400" />
//             <h3 className="font-black tracking-tight text-lg">
//               Configuration Matrix
//             </h3>
//           </div>
//           <CardContent className="p-6 space-y-5">
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//               {/* Row 1: Class & Subject */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1.5">
//                   <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
//                     Grade
//                   </Label>
//                   <Select
//                     onValueChange={(v) => setValue("class", v)}
//                     defaultValue="9"
//                   >
//                     <SelectTrigger className="rounded-xl border-2 font-black">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {[6, 7, 8, 9, 10].map((c) => (
//                         <SelectItem
//                           key={c}
//                           value={c.toString()}
//                           className="font-bold"
//                         >
//                           Class {c}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
//                     Subject
//                   </Label>
//                   <Select
//                     onValueChange={(v) => {
//                       setValue("subject", v);
//                       setSelectedChapters([]); // Reset chapters when subject changes
//                     }}
//                     defaultValue="Physics"
//                   >
//                     <SelectTrigger className="rounded-xl border-2 font-black">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {subjectsKPK.map((s) => (
//                         <SelectItem
//                           key={s.code}
//                           value={s.value}
//                           className="font-bold"
//                           defaultValue="Biology"
//                         >
//                           {s.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {/* Row 2: Exam Intent */}
//               <div className="space-y-1.5">
//                 <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
//                   Assessment Goal
//                 </Label>
//                 <Select
//                   onValueChange={(v) => setValue("examType", v)}
//                   defaultValue="Final Term"
//                 >
//                   <SelectTrigger className="rounded-xl border-2 font-black">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Diagnostic Test" className="font-bold">
//                       Diagnostic Test (Baseline)
//                     </SelectItem>
//                     <SelectItem
//                       value="Monthly Assessment"
//                       className="font-bold"
//                     >
//                       Monthly Assessment
//                     </SelectItem>
//                     <SelectItem value="Mid-Term Exam" className="font-bold">
//                       Mid-Term Exam
//                     </SelectItem>
//                     <SelectItem value="Final Term" className="font-bold">
//                       Final Term (Full Pattern)
//                     </SelectItem>
//                     <SelectItem value="Send-Up Exam" className="font-bold">
//                       Send-Up (Board Pre-Check)
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Row 3: Cognitive & Difficulty (Crucial for Mardan Board) */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1.5">
//                   <Label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1">
//                     <BrainCircuit className="w-3 h-3" /> Cognitive
//                   </Label>
//                   <Select
//                     onValueChange={(v) => setValue("cognitiveLevel", v)}
//                     defaultValue="Balanced (SLO Based)"
//                   >
//                     <SelectTrigger className="rounded-xl border-2 font-black text-xs">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Knowledge Based" className="font-bold">
//                         Knowledge (Rote)
//                       </SelectItem>
//                       <SelectItem
//                         value="Understanding Based"
//                         className="font-bold"
//                       >
//                         Understanding (Concept)
//                       </SelectItem>
//                       <SelectItem
//                         value="Application Based"
//                         className="font-bold"
//                       >
//                         Application (Problem)
//                       </SelectItem>
//                       <SelectItem
//                         value="Balanced (SLO Based)"
//                         className="font-bold"
//                       >
//                         Balanced (SLO)
//                       </SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
//                     Strictness
//                   </Label>
//                   <Select
//                     onValueChange={(v) => setValue("difficulty", v)}
//                     defaultValue="Standard Board Level"
//                   >
//                     <SelectTrigger className="rounded-xl border-2 font-black text-xs">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Easy" className="font-bold">
//                         Easy (Remedial)
//                       </SelectItem>
//                       <SelectItem
//                         value="Standard Board Level"
//                         className="font-bold"
//                       >
//                         Standard Board
//                       </SelectItem>
//                       <SelectItem
//                         value="Hard (Analytical)"
//                         className="font-bold"
//                       >
//                         Hard (Merit)
//                       </SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border-2">
//                 <div className="flex items-center gap-2">
//                   <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
//                     <Languages size={18} />
//                   </div>
//                   <Label className="font-bold">Urdu Medium Mode</Label>
//                 </div>
//                 <Switch
//                   checked={watch("language") === "Urdu"}
//                   onCheckedChange={(checked) =>
//                     setValue("language", checked ? "Urdu" : "English")
//                   }
//                 />
//               </div>

//               {/* Row 4: Chapter Selection */}
//               {/* <div className="space-y-1.5">
//                 <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
//                   Chapter/Syllabus Range
//                 </Label>
//                 <Input
//                   {...register("chapterRange")}
//                   className="rounded-xl border-2 font-bold"
//                   placeholder="e.g. Chapters 1 to 5 only"
//                 />
//               </div> */}

//               {/* DYNAMIC CHAPTER SELECTION */}
//               <div className="space-y-2">
//                 <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
//                   Chapter Selection
//                 </Label>
//                 <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border-2 rounded-xl bg-slate-50">
//                   {availableChapters.length > 0 ? (
//                     availableChapters.map((ch) => (
//                       <div key={ch} className="flex items-center space-x-2">
//                         <Checkbox
//                           id={ch}
//                           checked={selectedChapters.includes(ch)}
//                           onCheckedChange={() => handleChapterToggle(ch)}
//                         />
//                         <label
//                           htmlFor={ch}
//                           className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                         >
//                           {ch}
//                         </label>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-xs text-slate-400 italic">
//                       Select a subject to see chapters
//                     </p>
//                   )}
//                 </div>
//                 {selectedChapters.length === 0 && (
//                   <Badge
//                     variant="outline"
//                     className="mt-1 text-indigo-600 border-indigo-200"
//                   >
//                     Full Book Selected
//                   </Badge>
//                 )}
//               </div>

//               <div className="pt-4">
//                 <Button
//                   type="submit"
//                   className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all font-black text-lg gap-3"
//                   disabled={isGenerating}
//                 >
//                   {isGenerating ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />{" "}
//                       Architecting...
//                     </>
//                   ) : (
//                     <>
//                       <Wand2 className="w-6 h-6" /> Generate Masterpiece
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Right Preview Panel */}
//         <Card className="xl:col-span-8 border-2 border-slate-100 shadow-2xl rounded-[2rem] min-h-[700px] bg-white relative print:border-none print:shadow-none">
//           {!generatedPaper && !isGenerating && (
//             <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-slate-300">
//               <div className="bg-slate-50 p-8 rounded-full mb-6">
//                 <BookOpen className="w-20 h-20 opacity-20" />
//               </div>
//               <h3 className="text-2xl font-black text-slate-400 tracking-tight">
//                 Paper Canvas Empty
//               </h3>
//               <p className="max-w-xs font-bold mt-2">
//                 Configure the matrix on the left to generate a Board-standard
//                 assessment.
//               </p>
//             </div>
//           )}

//           {isGenerating && (
//             <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem]">
//               <div className="relative">
//                 <div className="h-24 w-24 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
//                 <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-8 h-8 animate-pulse" />
//               </div>
//               <p className="mt-6 text-xl font-black text-slate-900 animate-pulse">
//                 Consulting BISE SLO Standards...
//               </p>
//               <p className="text-slate-400 font-bold">
//                 This usually takes 15-20 seconds for a full paper.
//               </p>
//             </div>
//           )}

//           {generatedPaper && (
//             <CardContent className="p-8 md:p-12 print:p-0">
//               <div
//                 ref={paperRef}
//                 className="prose prose-slate max-w-none print:prose-p:my-1"
//               >
//                 <SolutionManual
//                   paperContent={generatedPaper.content}
//                   classLevel={generatedPaper.class}
//                   subject={generatedPaper.subject}
//                 />
//                 {/* BOARD HEADER STYLE */}
//                 {/* Inside the generatedPaper block */}
//                 <div className="text-center border-4 border-double border-slate-900 p-6 mb-8 rounded-xl print:rounded-none">
//                   <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter m-0">
//                     Government High School Mardan
//                   </h1>
//                   <div className="flex justify-center gap-2 mt-2">
//                     <Badge className="font-black border-slate-900 uppercase">
//                       {generatedPaper.title} {/* e.g., Final Term */}
//                     </Badge>
//                     <Badge className="font-black border-slate-900 uppercase">
//                       Session 2026
//                     </Badge>
//                   </div>

//                   <div className="grid grid-cols-3 gap-4 mt-6 text-[11px] font-black uppercase border-t-2 border-slate-900 pt-4">
//                     <div className="text-left">
//                       Class: {generatedPaper.class}
//                     </div>
//                     <div className="text-center">
//                       Subject: {generatedPaper.subject}
//                     </div>
//                     <div className="text-right">
//                       Time: {generatedPaper.duration}
//                     </div>
//                     <div className="text-left">
//                       Marks: {generatedPaper.totalMarks}
//                     </div>
//                     <div className="text-right col-span-2">
//                       Name: __________________________
//                     </div>
//                   </div>
//                 </div>

//                 {/* MARKDOWN CONTENT */}
//                 <div className="font-serif leading-relaxed text-slate-900">
//                   {/* <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                     {generatedPaper.content}
//                   </ReactMarkdown> */}
//                   <SmartRenderer content={generatedPaper.content} />
//                 </div>
//               </div>
//             </CardContent>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  Printer,
  FileText,
  Copy,
  Settings2,
  Sparkles,
  BookOpen,
  BrainCircuit,
  Languages,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { subjectsKPK } from "@/lib/constants";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { SmartRenderer } from "./SmartRenderer";
import { SolutionManual } from "./SolutionManual";

export function AIPapersContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const paperRef = useRef(null);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      class: "9",
      subject: "Physics",
      examType: "Final Term",
      totalMarks: "65",
      duration: "3 Hours",
      cognitiveLevel: "Balanced (SLO Based)",
      difficulty: "Standard Board Level",
      sections: "All Sections (A, B, C)",
      chapterRange: "Full Book",
      language: "English",
    },
  });

  const selectedSubjectValue = watch("subject");
  const currentSubjectData = subjectsKPK.find(
    (s) => s.value === selectedSubjectValue,
  );
  const availableChapters = currentSubjectData?.chapters || [];

  const handleChapterToggle = (chapter) => {
    const updated = selectedChapters.includes(chapter)
      ? selectedChapters.filter((c) => c !== chapter)
      : [...selectedChapters, chapter];
    setSelectedChapters(updated);
    setValue(
      "chapterRange",
      updated.length > 0 ? updated.join(", ") : "Full Book",
    );
  };

  const onSubmit = async (data) => {
    setIsGenerating(true);
    setGeneratedPaper(null);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "exam-paper", ...data }),
      });

      if (response.status === 429) {
        toast.error("Limit reached. Please wait a minute!");
        return;
      }

      const result = await response.json();
      if (result.paper) {
        setGeneratedPaper(result.paper);
        toast.success("BISE Standard Paper Generated!");
      }
    } catch (error) {
      toast.error("Generation failed. Check your API connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedPaper) return;
    try {
      await navigator.clipboard.writeText(generatedPaper.content);
      setCopied(true);
      toast.success("Paper copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy text.");
    }
  };

  const handleDownloadWord = async () => {
    try {
      const contentLines = Array.isArray(generatedPaper.content)
        ? generatedPaper.content
        : generatedPaper.content.split("\n").filter(Boolean);

      const body = {
        ...generatedPaper,
        content: contentLines,
      };

      const res = await fetch("/api/export-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${body.subject}_Class${body.class}.docx`;
      a.click();
      toast.success("Word document ready!");
    } catch (err) {
      toast.error("Word export failed.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-4 print:p-0 print:m-0">
      {/* CSS for Professional Printing */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: white !important;
          }
          .print-hidden {
            display: none !important;
          }
          .print-break-before {
            page-break-before: always;
          }
          .prose {
            max-width: none !important;
            color: black !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print-hidden">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-indigo-600 w-8 h-8" />
            Paper Architect{" "}
            <span className="text-indigo-600 text-sm bg-indigo-50 px-3 py-1 rounded-full">
              PRO v2.5
            </span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] mt-1">
            BISE Mardan Standardized Paper Generator
          </p>
        </div>

        {generatedPaper && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="rounded-xl font-black border-2 transition-all"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copied" : "Copy text"}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="rounded-xl font-black border-2 border-slate-200"
            >
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button
              onClick={handleDownloadWord}
              className="bg-slate-900 rounded-xl font-black px-6 shadow-xl gap-2"
            >
              <FileText className="w-4 h-4" /> Word
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <Card className="xl:col-span-4 border-2 border-slate-100 h-screen shadow-2xl rounded-[2rem] overflow-hidden print-hidden">
          <div className="bg-slate-50 p-4 text-black flex items-center gap-3 border-b-2 border-slate-100">
            <Settings2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black tracking-tight text-lg">
              Configuration Matrix
            </h3>
          </div>
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Grade
                  </Label>
                  <Select
                    onValueChange={(v) => setValue("class", v)}
                    defaultValue="9"
                  >
                    <SelectTrigger className="rounded-xl border-2 font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 7, 8, 9, 10].map((c) => (
                        <SelectItem
                          key={c}
                          value={c.toString()}
                          className="font-bold"
                        >
                          Class {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Subject
                  </Label>
                  <Select
                    onValueChange={(v) => {
                      setValue("subject", v);
                      setSelectedChapters([]);
                    }}
                    defaultValue="Physics"
                  >
                    <SelectTrigger className="rounded-xl border-2 font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectsKPK.map((s) => (
                        <SelectItem
                          key={s.code}
                          value={s.value}
                          className="font-bold"
                        >
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Assessment Goal
                </Label>
                <Select
                  onValueChange={(v) => setValue("examType", v)}
                  defaultValue="Final Term"
                >
                  <SelectTrigger className="rounded-xl border-2 font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diagnostic Test" className="font-bold">
                      Diagnostic Test
                    </SelectItem>
                    <SelectItem
                      value="Monthly Assessment"
                      className="font-bold"
                    >
                      Monthly Assessment
                    </SelectItem>
                    <SelectItem value="Mid-Term Exam" className="font-bold">
                      Mid-Term Exam
                    </SelectItem>
                    <SelectItem value="Final Term" className="font-bold">
                      Final Term (Full Pattern)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border-2">
                <div className="flex items-center gap-2">
                  <Languages className="text-indigo-600" size={18} />
                  <Label className="font-bold">Urdu Medium</Label>
                </div>
                <Switch
                  checked={watch("language") === "Urdu"}
                  onCheckedChange={(checked) =>
                    setValue("language", checked ? "Urdu" : "English")
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Chapter Selection
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border-2 rounded-xl bg-slate-50">
                  {availableChapters.length > 0 ? (
                    availableChapters.map((ch) => (
                      <div key={ch} className="flex items-center space-x-2">
                        <Checkbox
                          id={ch}
                          checked={selectedChapters.includes(ch)}
                          onCheckedChange={() => handleChapterToggle(ch)}
                        />
                        <label
                          htmlFor={ch}
                          className="text-sm font-bold cursor-pointer"
                        >
                          {ch}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Select subject first
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl font-black text-lg gap-3"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Wand2 />
                )}
                {isGenerating ? "Architecting..." : "Generate Paper"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Preview Panel */}
        <Card className="xl:col-span-8 border-2 border-slate-100 shadow-2xl rounded-[2rem] min-h-[700px] bg-white relative print:border-none print:shadow-none">
          {!generatedPaper && !isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-slate-300">
              <BookOpen className="w-20 h-20 opacity-20 mb-6" />
              <h3 className="text-2xl font-black text-slate-400 tracking-tight">
                Paper Canvas Empty
              </h3>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem]">
              <div className="h-16 w-16 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
              <p className="mt-6 text-xl font-black text-slate-900 animate-pulse">
                Consulting BISE Standards...
              </p>
            </div>
          )}

          {generatedPaper && (
            <CardContent className="p-8 md:p-12 print:p-0">
              <div ref={paperRef} className="prose prose-slate max-w-none">
                {/* BOARD HEADER STYLE */}
                <div className="text-center border-[3px] border-slate-900 p-6 mb-8 rounded-xl print:rounded-none">
                  <h1 className="text-2xl font-black text-slate-900 uppercase m-0">
                    Government High School Mardan
                  </h1>
                  <div className="flex justify-center gap-2 mt-2 print-hidden">
                    <Badge className="bg-slate-900">
                      {generatedPaper.title}
                    </Badge>
                    <Badge variant="outline">Session 2026</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-y-2 mt-6 text-[12px] font-bold uppercase border-t-2 border-slate-900 pt-4">
                    <div className="text-left">
                      Class: {generatedPaper.class}
                    </div>
                    <div className="text-center">
                      Subject: {generatedPaper.subject}
                    </div>
                    <div className="text-right">
                      Time: {generatedPaper.duration}
                    </div>
                    <div className="text-left">
                      Marks: {generatedPaper.totalMarks}
                    </div>
                    <div className="text-right col-span-2">
                      Name: __________________________
                    </div>
                  </div>
                </div>

                {/* MAIN PAPER CONTENT */}
                <div
                  className={`font-serif leading-relaxed text-slate-900 ${watch("language") === "Urdu" ? "text-right" : "text-left"}`}
                >
                  <SmartRenderer content={generatedPaper.content} />
                </div>

                {/* SOLUTION SECTION - Only shows if solution exists in the object */}
                {generatedPaper && (
                  <div className="mt-12 pt-8 border-t-4 border-double border-slate-200 print-break-before">
                    <div className="flex items-center justify-between mb-4 print-hidden">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        <BrainCircuit className="text-indigo-600" />
                        Answer Key & Solution Manual
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSolution(!showSolution)}
                      >
                        {showSolution ? (
                          <EyeOff className="w-4 h-4 mr-2" />
                        ) : (
                          <Eye className="w-4 h-4 mr-2" />
                        )}
                        {showSolution ? "Hide Solution" : "View Solution"}
                      </Button>
                    </div>

                    {(showSolution ||
                      (typeof window !== "undefined" &&
                        window.matchMedia("print").matches)) && (
                      <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 print:bg-white print:border-none">
                        <SmartRenderer content={generatedPaper.solution} />
                      </div>
                    )}
                  </div>
                )}

                {/* SOLUTION SECTION: This is where we place the manual */}
                <div className="mt-12 pt-8 border-t-4 border-double border-slate-200">
                  {/* Passing the correct props to ensure AI has context */}
                  <SolutionManual
                    paperContent={generatedPaper.content}
                    subject={generatedPaper.subject}
                    classLevel={generatedPaper.class}
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
