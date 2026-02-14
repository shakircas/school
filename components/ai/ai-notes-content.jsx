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
// import { Wand2, Download, Copy, BookOpen } from "lucide-react";
// import { toast } from "sonner";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { jsPDF } from "jspdf";
// import { Document, Packer, Paragraph, TextRun } from "docx";

// export function AINotesContent() {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedNotes, setGeneratedNotes] = useState(null);
//   const notesRef = useRef(null);

//   const { register, handleSubmit, setValue } = useForm();

//   const onSubmit = async (data) => {
//     setIsGenerating(true);
//     try {
//       const response = await fetch("/api/ai/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: "notes",
//           ...data,
//         }),
//       });

//       const result = await response.json();
//       if (result.notes) {
//         setGeneratedNotes(result.notes);
//         toast.success("Notes generated successfully!");
//       }
//     } catch (error) {
//       toast.error("Failed to generate notes");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handleCopy = () => {
//     if (generatedNotes) {
//       navigator.clipboard.writeText(generatedNotes.content);
//       toast.success("Copied to clipboard!");
//     }
//   };

//   const handleDownloadPDF = () => {
//     if (!generatedNotes) return;
//     const doc = new jsPDF("p", "pt", "a4");
//     const content = notesRef.current?.innerText || generatedNotes.content;
//     const lines = doc.splitTextToSize(content, 500);
//     doc.text(lines, 40, 40);
//     doc.save(`${generatedNotes.topic || "Notes"}.pdf`);
//   };

//   const handleDownloadDocx = async () => {
//     if (!generatedNotes) return;
//     const doc = new Document({
//       sections: [
//         {
//           properties: {},
//           children: [
//             new Paragraph({
//               children: [
//                 new TextRun({
//                   text: generatedNotes.topic || "Notes",
//                   bold: true,
//                   size: 32,
//                 }),
//               ],
//               spacing: { after: 300 },
//             }),
//             ...generatedNotes.content.split("\n").map(
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
//     a.download = `${generatedNotes.topic || "Notes"}.docx`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title="AI Notes Generator"
//         description="Generate comprehensive study notes using AI"
//       >
//         {generatedNotes && (
//           <div className="flex gap-2 flex-wrap">
//             <Button variant="outline" onClick={handleCopy}>
//               <Copy className="h-4 w-4 mr-2" />
//               Copy
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
//         <Card>
//           <CardHeader>
//             <CardTitle>Notes Settings</CardTitle>
//             <CardDescription>Configure your study notes</CardDescription>
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
//                 <Label htmlFor="topic">Topic</Label>
//                 <Input
//                   id="topic"
//                   {...register("topic", { required: true })}
//                   placeholder="Enter topic name"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="details">Additional Details</Label>
//                 <Textarea
//                   id="details"
//                   {...register("details")}
//                   placeholder="Any specific points to cover..."
//                   rows={3}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Notes Type</Label>
//                 <Select
//                   onValueChange={(value) => setValue("notesType", value)}
//                   defaultValue="comprehensive"
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="summary">Summary</SelectItem>
//                     <SelectItem value="comprehensive">Comprehensive</SelectItem>
//                     <SelectItem value="bullet">Bullet Points</SelectItem>
//                     <SelectItem value="qa">Q&A Format</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <Button type="submit" className="w-full" disabled={isGenerating}>
//                 {isGenerating ? (
//                   <>
//                     <LoadingSpinner className="mr-2" /> Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Wand2 className="h-4 w-4 mr-2" /> Generate Notes
//                   </>
//                 )}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Preview Panel */}
//         <Card className="lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Generated Notes</CardTitle>
//             <CardDescription>
//               {generatedNotes
//                 ? generatedNotes.topic
//                 : "Your AI-generated notes will appear here"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {isGenerating ? (
//               <div className="flex flex-col items-center justify-center py-12">
//                 <LoadingSpinner size="lg" />
//                 <p className="mt-4 text-muted-foreground">
//                   Generating study notes...
//                 </p>
//               </div>
//             ) : generatedNotes ? (
//               <div
//                 ref={notesRef}
//                 className="prose prose-sm max-w-none dark:prose-invert"
//               >
//                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                   {generatedNotes.content}
//                 </ReactMarkdown>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-12 text-center">
//                 <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
//                 <h3 className="text-lg font-medium mb-2">No Notes Generated</h3>
//                 <p className="text-muted-foreground">
//                   Configure settings and click "Generate Notes" to create
//                   AI-powered study notes.
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
  Copy,
  BookOpen,
  GraduationCap,
  ListChecks,
  FileJson,
  Sparkles,
  PenTool,
  Layout,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SmartRenderer } from "./SmartRenderer";
import { subjectsKPK } from "@/lib/constants";

export function AINotesContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const notesRef = useRef(null);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      class: "10",
      subject: "Chemistry",
      notesType: "Cornell Method",
      depth: "Conceptual & Detailed",
      includeExercises: "Yes",
    },
  });

  const onSubmit = async (data) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "notes", ...data }),
      });

      if (response.status === 429) {
        toast.error(
          "Google's free limit reached. Please wait a minute before trying again!",
        );
        return;
      }

      const result = await response.json();
      if (result.notes) {
        setGeneratedNotes(result.notes);
        toast.success("Professional Study Guide Prepared!");
      }
    } catch (error) {
      toast.error("Failed to generate notes. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-black tracking-tighter text-sm uppercase">
            <GraduationCap className="w-4 h-4" />
            Academic Resource Suite
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Study Guide <span className="text-indigo-600">Architect</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm">
            Create high-retention teaching materials in seconds.
          </p>
        </div>

        {generatedNotes && (
          <div className="flex gap-2 animate-in zoom-in-95 duration-300">
            <Button
              variant="outline"
              onClick={() => {
                /* copy logic */
              }}
              className="rounded-xl border-2 font-black"
            >
              <Copy className="w-4 h-4 mr-2" /> Copy Markdown
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-black shadow-lg shadow-indigo-100">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Input Matrix */}
        <Card className="xl:col-span-4 border-2 border-slate-100 shadow-xl rounded-[2rem] overflow-hidden self-start">
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layout className="w-5 h-5 text-indigo-400" />
              <h3 className="font-black">Note Matrix</h3>
            </div>
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Grade Level
                  </Label>
                  <Select
                    onValueChange={(v) => setValue("class", v)}
                    defaultValue="10"
                  >
                    <SelectTrigger className="rounded-xl border-2 font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 7, 8, 9, 10, 11, 12].map((c) => (
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
                      // setSelectedChapters([]);
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
                  Teaching Strategy (Format)
                </Label>
                <Select
                  onValueChange={(v) => setValue("notesType", v)}
                  defaultValue="Cornell Method"
                >
                  <SelectTrigger className="rounded-xl border-2 font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cornell Method" className="font-bold">
                      Cornell Notes (Cues + Summary)
                    </SelectItem>
                    <SelectItem value="Lesson Plan" className="font-bold">
                      Lesson Plan (SLOs + Timeline)
                    </SelectItem>
                    <SelectItem value="Handout" className="font-bold">
                      Handout (Fill-in-the-Blanks)
                    </SelectItem>
                    <SelectItem
                      value="Mind Map Structure"
                      className="font-bold"
                    >
                      Mind Map (Hierarchical)
                    </SelectItem>
                    <SelectItem value="Q&A Guide" className="font-bold">
                      Exam-Focused Q&A
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Academic Depth
                </Label>
                <Select
                  onValueChange={(v) => setValue("depth", v)}
                  defaultValue="Conceptual & Detailed"
                >
                  <SelectTrigger className="rounded-xl border-2 font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="Quick Revision"
                      className="font-bold text-emerald-600"
                    >
                      Quick Revision (Last Minute)
                    </SelectItem>
                    <SelectItem value="Standard Textbook" className="font-bold">
                      Standard Textbook Level
                    </SelectItem>
                    <SelectItem
                      value="Conceptual & Detailed"
                      className="font-bold text-indigo-600"
                    >
                      Detailed (Advanced)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Topic Title
                </Label>
                <Input
                  {...register("topic", { required: true })}
                  placeholder="e.g. Periodic Table Trends"
                  className="rounded-xl border-2 font-bold h-12 border-slate-200 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Focus Points (Optional)
                </Label>
                <Textarea
                  {...register("details")}
                  placeholder="e.g. Focus specifically on electronegativity and atomic radius..."
                  rows={3}
                  className="rounded-xl border-2 font-medium resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-black text-lg gap-3 transition-transform active:scale-95"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <PenTool className="w-5 h-5" />
                )}
                Draft Materials
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Content Preview */}
        <Card className="xl:col-span-8 border-2 border-slate-100 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden min-h-[700px]">
          {!generatedNotes && !isGenerating && (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-20">
              <div className="bg-slate-50 p-10 rounded-full mb-6">
                <BookOpen className="w-16 h-16 opacity-20" />
              </div>
              <h3 className="text-xl font-black text-slate-400 tracking-tight">
                Ready for Input
              </h3>
              <p className="font-bold text-slate-400 mt-1 uppercase text-[10px] tracking-widest">
                Select your matrix to begin drafting
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
                <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xl font-black text-slate-900">
                Synthesizing Educational Content...
              </p>
            </div>
          )}

          {generatedNotes && (
            <CardContent className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2">
                  <div className="space-y-1">
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-50 font-black px-3 py-1 uppercase text-[10px]">
                      {generatedNotes.subject} • Class {generatedNotes.class}
                    </Badge>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      {generatedNotes.topic}
                    </h2>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase">
                      Format
                    </p>
                    <p className="font-black text-slate-700">
                      {watch("notesType")}
                    </p>
                  </div>
                </div>

                <div
                  ref={notesRef}
                  className="prose prose-slate prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-li:font-medium max-w-none"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {generatedNotes.content}
                  </ReactMarkdown>
                  {/* <SmartRenderer content={generatedNotes} /> */}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
