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
// import { PageHeader } from "@/components/ui/page-header";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { Badge } from "@/components/ui/badge";
// import { Wand2, Download, Printer, FileText, Copy } from "lucide-react";
// import { toast } from "sonner";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { jsPDF } from "jspdf";
// import { Document, Packer, Paragraph, TextRun } from "docx";

// export function AIPapersContent() {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedPaper, setGeneratedPaper] = useState(null);
//   const paperRef = useRef(null);

//   const { register, handleSubmit, setValue } = useForm({
//     defaultValues: {
//       class: "",
//       subject: "",
//       examType: "midterm",
//       totalMarks: "100",
//       duration: "3 hours",
//       topics: "",
//       questionTypes: "mcq,short,long",
//     },
//   });

//   const onSubmit = async (data) => {
//     setIsGenerating(true);
//     try {
//       const response = await fetch("/api/ai/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: "exam-paper",
//           subject: data.subject,
//           class: data.class,
//           topic: data.topics || "Complete Syllabus",
//         }),
//       });

//       const result = await response.json();

//       if (result.paper) {
//         setGeneratedPaper(result.paper);
//         toast.success("Paper generated successfully!");
//       } else {
//         throw new Error("Failed to generate paper");
//       }
//     } catch (error) {
//       toast.error("Failed to generate paper. Please try again.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleCopy = () => {
//     if (generatedPaper) {
//       navigator.clipboard.writeText(generatedPaper.content);
//       toast.success("Copied to clipboard!");
//     }
//   };

//   const handleDownloadPDF = () => {
//     if (!generatedPaper) return;
//     const doc = new jsPDF("p", "pt", "a4");
//     const content = paperRef.current?.innerText || generatedPaper.content;
//     const lines = doc.splitTextToSize(content, 500);
//     doc.text(lines, 40, 40);
//     doc.save(`${generatedPaper.title}.pdf`);
//   };

//   const handleDownloadDocx = async () => {
//     if (!generatedPaper) return;
//     const doc = new Document({
//       sections: [
//         {
//           properties: {},
//           children: [
//             new Paragraph({
//               children: [
//                 new TextRun({
//                   text: generatedPaper.title,
//                   bold: true,
//                   size: 32,
//                 }),
//               ],
//               spacing: { after: 300 },
//             }),
//             new Paragraph({
//               children: [
//                 new TextRun({
//                   text: `Class: ${generatedPaper.class} | Subject: ${generatedPaper.subject} | Total Marks: ${generatedPaper.totalMarks} | Duration: ${generatedPaper.duration}`,
//                   italics: true,
//                 }),
//               ],
//               spacing: { after: 300 },
//             }),
//             ...generatedPaper.content.split("\n").map(
//               (line) =>
//                 new Paragraph({
//                   children: [new TextRun({ text: line })],
//                   spacing: { after: 100 },
//                 })
//             ),
//           ],
//         },
//       ],
//     });
//     const blob = await Packer.toBlob(doc);
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${generatedPaper.title}.docx`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title="AI Paper Generator"
//         description="Generate exam papers using Gemini AI"
//       >
//         {generatedPaper && (
//           <div className="flex gap-2 flex-wrap">
//             <Button variant="outline" onClick={handleCopy}>
//               <Copy className="h-4 w-4 mr-2" />
//               Copy
//             </Button>
//             <Button variant="outline" onClick={handlePrint}>
//               <Printer className="h-4 w-4 mr-2" />
//               Print
//             </Button>
//             <Button variant="outline" onClick={handleDownloadPDF}>
//               <Download className="h-4 w-4 mr-2" />
//               Download PDF
//             </Button>
//             <Button variant="outline" onClick={handleDownloadDocx}>
//               <Download className="h-4 w-4 mr-2" />
//               Download DOCX
//             </Button>
//           </div>
//         )}
//       </PageHeader>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Settings Panel */}
//         <Card className="lg:col-span-1">
//           <CardHeader>
//             <CardTitle>Paper Settings</CardTitle>
//             <CardDescription>Configure your exam paper</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               <div className="space-y-2">
//                 <Label>Class</Label>
//                 <Select onValueChange={(value) => setValue("class", value)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select class" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {[6, 7, 8, 9, 10].map((cls) => (
//                       <SelectItem key={cls} value={cls.toString()}>
//                         Class {cls}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label>Subject</Label>
//                 <Select onValueChange={(value) => setValue("subject", value)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select subject" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {[
//                       "math",
//                       "english",
//                       "science",
//                       "urdu",
//                       "islamiat",
//                       "computer",
//                       "physics",
//                       "chemistry",
//                       "biology",
//                     ].map((sub) => (
//                       <SelectItem key={sub} value={sub}>
//                         {sub.charAt(0).toUpperCase() + sub.slice(1)}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label>Exam Type</Label>
//                 <Select
//                   onValueChange={(value) => setValue("examType", value)}
//                   defaultValue="midterm"
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="weekly">Weekly Test</SelectItem>
//                     <SelectItem value="monthly">Monthly Test</SelectItem>
//                     <SelectItem value="midterm">Mid-term</SelectItem>
//                     <SelectItem value="final">Final Exam</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="totalMarks">Total Marks</Label>
//                   <Input
//                     id="totalMarks"
//                     {...register("totalMarks")}
//                     placeholder="100"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="duration">Duration</Label>
//                   <Input
//                     id="duration"
//                     {...register("duration")}
//                     placeholder="3 hours"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="topics">Topics (Optional)</Label>
//                 <Textarea
//                   id="topics"
//                   {...register("topics")}
//                   rows={3}
//                   placeholder="Enter topics separated by commas"
//                 />
//               </div>

//               <Button type="submit" className="w-full" disabled={isGenerating}>
//                 {isGenerating ? (
//                   <>
//                     <LoadingSpinner className="mr-2" /> Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Wand2 className="h-4 w-4 mr-2" /> Generate Paper
//                   </>
//                 )}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Preview Panel */}
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Paper Preview</CardTitle>
//             <CardDescription>
//               {generatedPaper
//                 ? "Your generated exam paper"
//                 : "Configure settings and generate a paper"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {isGenerating ? (
//               <div className="flex flex-col items-center justify-center py-12">
//                 <LoadingSpinner size="lg" />
//                 <p className="mt-4 text-muted-foreground">
//                   Generating your exam paper...
//                 </p>
//               </div>
//             ) : generatedPaper ? (
//               <div
//                 ref={paperRef}
//                 className="prose prose-sm max-w-none dark:prose-invert"
//               >
//                 <div className="text-center mb-6 pb-4 border-b">
//                   <h1 className="text-2xl font-bold mb-1">EduManage School</h1>
//                   <h2 className="text-lg mb-2">{generatedPaper.title}</h2>
//                   <div className="flex justify-center gap-4 text-sm text-muted-foreground">
//                     <span>Class: {generatedPaper.class}</span>
//                     <span>Subject: {generatedPaper.subject}</span>
//                     <span>Total Marks: {generatedPaper.totalMarks}</span>
//                     <span>Time: {generatedPaper.duration}</span>
//                   </div>
//                 </div>
//                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                   {generatedPaper.content}
//                 </ReactMarkdown>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-12 text-center">
//                 <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
//                 <h3 className="text-lg font-medium mb-2">No Paper Generated</h3>
//                 <p className="text-muted-foreground max-w-sm">
//                   Configure your paper settings and click "Generate Paper" to
//                   create an AI-powered exam paper.
//                 </p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  Download,
  Printer,
  FileText,
  Copy,
  Settings2,
  Sparkles,
  BookOpen,
  Target,
  BrainCircuit,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SolutionManual } from "./SolutionManual";

export function AIPapersContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState(null);
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
    },
  });

  const onSubmit = async (data) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "exam-paper",
          ...data,
        }),
      });

      if (response.status === 429) {
        toast.error(
          "Google's free limit reached. Please wait a minute before trying again!"
        );
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

  console.log(generatedPaper);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 print:p-0">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-indigo-600 w-8 h-8" />
            Paper Architect{" "}
            <span className="text-indigo-600 text-sm bg-indigo-50 px-3 py-1 rounded-full ml-2">
              PRO v2.5
            </span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] mt-1">
            BISE Mardan Standardized Paper Generator
          </p>
        </div>

        {generatedPaper && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="rounded-xl font-black border-2 border-slate-200"
            >
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button className="bg-slate-900 rounded-xl font-black px-6 shadow-xl">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Control Panel: High Density Settings */}
        <Card className="xl:col-span-4 border-2 border-slate-100 shadow-2xl rounded-[2rem] overflow-hidden print:hidden">
          <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-black tracking-tight text-lg">
              Configuration Matrix
            </h3>
          </div>
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Row 1: Class & Subject */}
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
                    onValueChange={(v) => setValue("subject", v)}
                    defaultValue="Physics"
                  >
                    <SelectTrigger className="rounded-xl border-2 font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Physics",
                        "Chemistry",
                        "Biology",
                        "Mathematics",
                        "Computer Science",
                        "English",
                        "Urdu",
                        "Islamiat",
                        "Pak Studies",
                      ].map((s) => (
                        <SelectItem key={s} value={s} className="font-bold">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Exam Intent */}
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
                      Diagnostic Test (Baseline)
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
                    <SelectItem value="Send-Up Exam" className="font-bold">
                      Send-Up (Board Pre-Check)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 3: Cognitive & Difficulty (Crucial for Mardan Board) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3" /> Cognitive
                  </Label>
                  <Select
                    onValueChange={(v) => setValue("cognitiveLevel", v)}
                    defaultValue="Balanced (SLO Based)"
                  >
                    <SelectTrigger className="rounded-xl border-2 font-black text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Knowledge Based" className="font-bold">
                        Knowledge (Rote)
                      </SelectItem>
                      <SelectItem
                        value="Understanding Based"
                        className="font-bold"
                      >
                        Understanding (Concept)
                      </SelectItem>
                      <SelectItem
                        value="Application Based"
                        className="font-bold"
                      >
                        Application (Problem)
                      </SelectItem>
                      <SelectItem
                        value="Balanced (SLO Based)"
                        className="font-bold"
                      >
                        Balanced (SLO)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Strictness
                  </Label>
                  <Select
                    onValueChange={(v) => setValue("difficulty", v)}
                    defaultValue="Standard Board Level"
                  >
                    <SelectTrigger className="rounded-xl border-2 font-black text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy" className="font-bold">
                        Easy (Remedial)
                      </SelectItem>
                      <SelectItem
                        value="Standard Board Level"
                        className="font-bold"
                      >
                        Standard Board
                      </SelectItem>
                      <SelectItem
                        value="Hard (Analytical)"
                        className="font-bold"
                      >
                        Hard (Merit)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Chapter Selection */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Chapter/Syllabus Range
                </Label>
                <Input
                  {...register("chapterRange")}
                  className="rounded-xl border-2 font-bold"
                  placeholder="e.g. Chapters 1 to 5 only"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all font-black text-lg gap-3"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />{" "}
                      Architecting...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-6 h-6" /> Generate Masterpiece
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Preview Panel */}
        <Card className="xl:col-span-8 border-2 border-slate-100 shadow-2xl rounded-[2rem] min-h-[700px] bg-white relative print:border-none print:shadow-none">
          {!generatedPaper && !isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-slate-300">
              <div className="bg-slate-50 p-8 rounded-full mb-6">
                <BookOpen className="w-20 h-20 opacity-20" />
              </div>
              <h3 className="text-2xl font-black text-slate-400 tracking-tight">
                Paper Canvas Empty
              </h3>
              <p className="max-w-xs font-bold mt-2">
                Configure the matrix on the left to generate a Board-standard
                assessment.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem]">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-8 h-8 animate-pulse" />
              </div>
              <p className="mt-6 text-xl font-black text-slate-900 animate-pulse">
                Consulting BISE SLO Standards...
              </p>
              <p className="text-slate-400 font-bold">
                This usually takes 15-20 seconds for a full paper.
              </p>
            </div>
          )}

          {generatedPaper && (
            <CardContent className="p-8 md:p-12 print:p-0">
              <div
                ref={paperRef}
                className="prose prose-slate max-w-none print:prose-p:my-1"
              >
                <SolutionManual
                  paperContent={generatedPaper.content}
                  classLevel={generatedPaper.class}
                  subject={generatedPaper.subject}
                />
                {/* BOARD HEADER STYLE */}
                <div className="text-center border-4 border-double border-slate-900 p-6 mb-8 rounded-xl print:rounded-none">
                  <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter m-0">
                    Government High School Mardan
                  </h1>
                  <div className="flex justify-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="font-black border-slate-900 uppercase"
                    >
                      {generatedPaper.title}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="font-black border-slate-900 uppercase"
                    >
                      Session 2026
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6 text-[11px] font-black uppercase border-t-2 border-slate-900 pt-4">
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
                    <div className="text-center col-span-2 text-right">
                      Name: __________________________
                    </div>
                  </div>
                </div>

                {/* MARKDOWN CONTENT */}
                <div className="font-serif leading-relaxed text-slate-900">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {generatedPaper.content}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
