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
// import { PageHeader } from "@/components/ui/page-header";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { Wand2, Copy, Download, Printer, BookOpen } from "lucide-react";
// import { toast } from "sonner";
// import ReactMarkdown from "react-markdown";
// import rehypeRaw from "rehype-raw";

// export function AIMCQsContent() {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedMCQs, setGeneratedMCQs] = useState(null);
//   const mcqRef = useRef(null);

//   const { register, handleSubmit, setValue } = useForm({
//     defaultValues: {
//       class: "",
//       subject: "",
//       topic: "",
//       count: 10,
//       difficulty: "Medium",
//     },
//   });

//   const onSubmit = async (data) => {
//     setIsGenerating(true);
//     try {
//       const response = await fetch("/api/ai/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: "mcqs",
//           class: data.class,
//           subject: data.subject,
//           topic: data.topic || "Relevant syllabus",
//           count: data.count || 10,
//           difficulty: data.difficulty || "Medium",
//         }),
//       });

//       const result = await response.json();

//       if (result.questions) {
//         setGeneratedMCQs(result.questions);
//         toast.success("MCQs generated successfully!");
//       } else {
//         throw new Error("Failed to generate MCQs");
//       }
//     } catch (err) {
//       toast.error("Failed to generate MCQs. Try again.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handleCopy = () => {
//     if (generatedMCQs) {
//       // Format the MCQs into a human-readable text string
//       const formattedText = generatedMCQs
//         .map((mcq, index) => {
//           // Start with the question number and the question text
//           let questionText = `${index + 1}. ${mcq.question}\n`;

//           // Add options, assuming options are an array of strings or objects with a value property
//           if (mcq.options && Array.isArray(mcq.options)) {
//             // You might need to adjust this part based on your exact 'mcq.options' structure
//             const optionsText = mcq.options
//               .map((option, i) => {
//                 // Convert option index (0, 1, 2, 3) to A, B, C, D
//                 const optionLetter = String.fromCharCode(65 + i);
//                 // Adjust 'option.text' to the correct property if necessary (e.g., 'option.value')
//                 return `  ${optionLetter}. ${option.text || option}\n`;
//               })
//               .join(""); // Join options without extra separators

//             questionText += optionsText;
//           }

//           // Add the correct answer (optional, for reference)
//           if (mcq.correctAnswer) {
//             questionText += `Correct Answer: ${mcq.correctAnswer}\n`;
//           }

//           return questionText;
//         })
//         .join("\n"); // Separate each MCQ with an extra line break

//       // Use the Clipboard API to write the plain text
//       navigator.clipboard
//         .writeText(formattedText)
//         .then(() => {
//           toast.success("MCQs copied to clipboard, ready for Word!");
//         })
//         .catch((err) => {
//           console.error("Failed to copy text: ", err);
//           toast.error("Failed to copy text.");
//         });
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title="AI MCQs Generator"
//         description="Generate multiple choice questions for your syllabus"
//       >
//         {generatedMCQs && (
//           <div className="flex flex-wrap gap-2">
//             <Button variant="outline" onClick={handleCopy}>
//               <Copy className="h-4 w-4 mr-2" />
//               Copy
//             </Button>
//             <Button variant="outline" onClick={handlePrint}>
//               <Printer className="h-4 w-4 mr-2" />
//               Print
//             </Button>
//             <Button>
//               <Download className="h-4 w-4 mr-2" />
//               Download JSON
//             </Button>
//           </div>
//         )}
//       </PageHeader>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Settings Panel */}
//         <Card className="lg:col-span-1 shadow-lg border border-gray-200 dark:border-gray-700">
//           <CardHeader>
//             <CardTitle>MCQs Settings</CardTitle>
//             <CardDescription>Configure your MCQs generation</CardDescription>
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
//                   {...register("topic")}
//                   placeholder="Enter topic"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="count">Number of Questions</Label>
//                   <Input
//                     id="count"
//                     type="number"
//                     {...register("count")}
//                     placeholder="10"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Difficulty</Label>
//                   <Select
//                     onValueChange={(value) => setValue("difficulty", value)}
//                     defaultValue="Medium"
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Easy">Easy</SelectItem>
//                       <SelectItem value="Medium">Medium</SelectItem>
//                       <SelectItem value="Hard">Hard</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <Button type="submit" className="w-full" disabled={isGenerating}>
//                 {isGenerating ? (
//                   <>
//                     <LoadingSpinner className="mr-2" /> Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Wand2 className="h-4 w-4 mr-2" /> Generate MCQs
//                   </>
//                 )}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Preview Panel */}
//         <Card className="lg:col-span-2 shadow-lg border border-gray-200 dark:border-gray-700">
//           <CardHeader>
//             <CardTitle>Generated MCQs</CardTitle>
//             <CardDescription>
//               {generatedMCQs
//                 ? "Preview of generated MCQs"
//                 : "Configure settings and generate MCQs"}
//             </CardDescription>
//           </CardHeader>
//           <CardContent ref={mcqRef}>
//             {isGenerating ? (
//               <div className="flex flex-col items-center justify-center py-12">
//                 <LoadingSpinner size="lg" />
//                 <p className="mt-4 text-muted-foreground">Generating MCQs...</p>
//               </div>
//             ) : generatedMCQs ? (
//               <div className="space-y-6">
//                 {generatedMCQs.map((q, i) => (
//                   <div
//                     key={i}
//                     className="p-4 border rounded-lg hover:shadow-md transition-shadow"
//                   >
//                     <p className="font-semibold mb-2">
//                       Q{i + 1}:{" "}
//                       <ReactMarkdown rehypePlugins={[rehypeRaw]}>
//                         {q.question}
//                       </ReactMarkdown>
//                     </p>
//                     <ul className="list-disc ml-5 space-y-1">
//                       {q.options.map((opt, idx) => (
//                         <li key={idx}>
//                           <ReactMarkdown rehypePlugins={[rehypeRaw]}>
//                             {opt}
//                           </ReactMarkdown>
//                         </li>
//                       ))}
//                     </ul>
//                     <p className="mt-2 font-medium">
//                       Answer:{" "}
//                       <ReactMarkdown rehypePlugins={[rehypeRaw]}>
//                         {q.correctAnswer}
//                       </ReactMarkdown>
//                     </p>
//                     <p className="text-muted-foreground italic mt-1">
//                       <ReactMarkdown rehypePlugins={[rehypeRaw]}>
//                         {q.explanation}
//                       </ReactMarkdown>
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-12 text-center">
//                 <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
//                 <h3 className="text-lg font-medium mb-2">No MCQs Generated</h3>
//                 <p className="text-muted-foreground">
//                   Configure your settings and click "Generate MCQs" to see
//                   results.
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
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  Copy,
  Printer,
  CheckCircle2,
  Layers,
  Brain,
  FileStack,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export function AIMCQsContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMCQs, setGeneratedMCQs] = useState(null);
  const mcqRef = useRef(null);

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      class: "9",
      subject: "Biology",
      topic: "",
      count: 12,
      difficulty: "Medium",
      cognitiveDomain: "Understanding (Conceptual)",
      style: "Standard BISE Pattern",
    },
  });

  const onSubmit = async (data) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "mcqs", ...data }),
      });

      if (response.status === 429) {
        toast.error(
          "Google's free limit reached. Please wait a minute before trying again!"
        );
        return;
      }

      const result = await response.json();
      if (result.questions) {
        setGeneratedMCQs(result.questions);
        toast.success("Board-Standard MCQs Ready!");
      }
    } catch (err) {
      toast.error("Generation failed. Please check your connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedMCQs) {
      const formattedText = generatedMCQs
        .map(
          (q, i) =>
            `${i + 1}. ${q.question}\nA) ${q.options[0]}\nB) ${
              q.options[1]
            }\nC) ${q.options[2]}\nD) ${q.options[3]}\nCorrect: ${
              q.correctAnswer
            }\n`
        )
        .join("\n");
      navigator.clipboard.writeText(formattedText);
      toast.success("Copied for Microsoft Word!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Layers className="text-indigo-600 w-8 h-8" />
            MCQ Intelligence
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">
            BISE Mardan SLO-Based Item Bank Generator
          </p>
        </div>

        {generatedMCQs && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="rounded-xl font-black border-2 h-11"
            >
              <Copy className="w-4 h-4 mr-2" /> Copy to Word
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="rounded-xl font-black border-2 h-11"
            >
              <Printer className="w-4 h-4 mr-2" /> Print Key
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Settings Panel */}
        <Card className="xl:col-span-4 border-2 border-slate-100 shadow-2xl rounded-[2.5rem] overflow-hidden self-start print:hidden">
          <div className="bg-indigo-600 p-6 text-white flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-200" />
            <h3 className="font-black text-lg">MCQ Parameters</h3>
          </div>
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        <SelectItem key={c} value={c.toString()}>
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
                    defaultValue="Biology"
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
                        "Computer",
                        "English",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Cognitive Domain (Bloom's)
                </Label>
                <Select
                  onValueChange={(v) => setValue("cognitiveDomain", v)}
                  defaultValue="Understanding (Conceptual)"
                >
                  <SelectTrigger className="rounded-xl border-2 font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Knowledge (Recall)">
                      Knowledge (Recall/Fact)
                    </SelectItem>
                    <SelectItem value="Understanding (Conceptual)">
                      Understanding (Conceptual)
                    </SelectItem>
                    <SelectItem value="Application (Problem Solving)">
                      Application (Scenario)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Specific Topic or Chapter
                </Label>
                <Input
                  {...register("topic")}
                  placeholder="e.g. Cell Division, Ohm's Law"
                  className="rounded-xl border-2 font-bold h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Count
                  </Label>
                  <Input
                    type="number"
                    {...register("count")}
                    className="rounded-xl border-2 font-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Difficulty
                  </Label>
                  <Select
                    onValueChange={(v) => setValue("difficulty", v)}
                    defaultValue="Medium"
                  >
                    <SelectTrigger className="rounded-xl border-2 font-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-lg gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                Generate MCQ Bank
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="xl:col-span-8 border-2 border-slate-100 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden min-h-[600px]">
          <CardHeader className="border-b-2 border-slate-50 bg-slate-50/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-black text-slate-900 tracking-tight">
                  Examination Item Bank
                </CardTitle>
                <CardDescription className="font-bold">
                  Live Preview & Assessment Key
                </CardDescription>
              </div>
              {generatedMCQs && (
                <Badge className="bg-emerald-500 font-black px-4 py-1">
                  {generatedMCQs.length} Items
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
                  <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Generating Cognitive Items
                </h3>
                <p className="text-slate-400 font-bold">
                  Mapping options to correct distractors...
                </p>
              </div>
            ) : generatedMCQs ? (
              <div className="divide-y-2 divide-slate-50">
                {generatedMCQs.map((q, i) => (
                  <div
                    key={i}
                    className="p-8 hover:bg-slate-50/50 transition-colors group relative"
                  >
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-slate-200">
                        {i + 1}
                      </div>
                      <div className="flex-grow space-y-4">
                        <div className="text-lg font-black text-slate-900 leading-tight pr-12">
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {q.question}
                          </ReactMarkdown>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, idx) => {
                            const isCorrect = idx === q.correctAnswer;
                            return (
                              <div
                                key={idx}
                                className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                                  isCorrect
                                    ? "border-emerald-500 bg-emerald-50/50"
                                    : "border-slate-100 bg-white"
                                }`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                                    isCorrect
                                      ? "bg-emerald-500 text-white"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {String.fromCharCode(65 + idx)}
                                </div>
                                <span
                                  className={`font-bold text-sm ${
                                    isCorrect
                                      ? "text-emerald-700"
                                      : "text-slate-600"
                                  }`}
                                >
                                  {opt}
                                </span>
                                {isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="bg-amber-50/50 p-4 rounded-2xl border-2 border-amber-100/50">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" /> Teacher's
                            Explanation
                          </p>
                          <p className="text-sm font-bold text-slate-700 italic leading-relaxed">
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                              {q.explanation}
                            </ReactMarkdown>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                <FileStack className="w-20 h-20 opacity-20 mb-4" />
                <p className="text-xl font-black">Bank is Empty</p>
                <p className="font-bold text-slate-400">
                  Configure parameters to generate questions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}