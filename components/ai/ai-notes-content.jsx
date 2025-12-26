// "use client";

// import { useState } from "react";
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

// export function AINotesContent() {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedNotes, setGeneratedNotes] = useState(null);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm();

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
//       console.log(result);

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

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title="AI Notes Generator"
//         description="Generate comprehensive study notes using AI"
//       >
//         {generatedNotes && (
//           <div className="flex gap-2">
//             <Button variant="outline" onClick={handleCopy}>
//               <Copy className="h-4 w-4 mr-2" />
//               Copy
//             </Button>
//             <Button>
//               <Download className="h-4 w-4 mr-2" />
//               Download
//             </Button>
//           </div>
//         )}
//       </PageHeader>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
//                     {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => (
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
//                     <SelectItem value="math">Mathematics</SelectItem>
//                     <SelectItem value="english">English</SelectItem>
//                     <SelectItem value="science">Science</SelectItem>
//                     <SelectItem value="urdu">Urdu</SelectItem>
//                     <SelectItem value="islamiat">Islamiat</SelectItem>
//                     <SelectItem value="computer">Computer</SelectItem>
//                     <SelectItem value="physics">Physics</SelectItem>
//                     <SelectItem value="chemistry">Chemistry</SelectItem>
//                     <SelectItem value="biology">Biology</SelectItem>
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
//                     <LoadingSpinner className="mr-2" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Wand2 className="h-4 w-4 mr-2" />
//                     Generate Notes
//                   </>
//                 )}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

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
//               <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
//                 {generatedNotes.content}
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-12 text-center">
//                 <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
//                 <h3 className="text-lg font-medium mb-2">No Notes Generated</h3>
//                 <p className="text-muted-foreground">
//                   Configure settings and generate notes
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
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Wand2, Download, Copy, BookOpen } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

export function AINotesContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const notesRef = useRef(null);

  const { register, handleSubmit, setValue } = useForm();

  const onSubmit = async (data) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "notes",
          ...data,
        }),
      });

      const result = await response.json();
      if (result.notes) {
        setGeneratedNotes(result.notes);
        toast.success("Notes generated successfully!");
      }
    } catch (error) {
      toast.error("Failed to generate notes");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedNotes) {
      navigator.clipboard.writeText(generatedNotes.content);
      toast.success("Copied to clipboard!");
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedNotes) return;
    const doc = new jsPDF("p", "pt", "a4");
    const content = notesRef.current?.innerText || generatedNotes.content;
    const lines = doc.splitTextToSize(content, 500);
    doc.text(lines, 40, 40);
    doc.save(`${generatedNotes.topic || "Notes"}.pdf`);
  };

  const handleDownloadDocx = async () => {
    if (!generatedNotes) return;
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: generatedNotes.topic || "Notes",
                  bold: true,
                  size: 32,
                }),
              ],
              spacing: { after: 300 },
            }),
            ...generatedNotes.content.split("\n").map(
              (line) =>
                new Paragraph({
                  children: [new TextRun({ text: line })],
                  spacing: { after: 100 },
                })
            ),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generatedNotes.topic || "Notes"}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Notes Generator"
        description="Generate comprehensive study notes using AI"
      >
        {generatedNotes && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleDownloadDocx}>
              <Download className="h-4 w-4 mr-2" />
              Download DOCX
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Notes Settings</CardTitle>
            <CardDescription>Configure your study notes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select onValueChange={(value) => setValue("class", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10].map((cls) => (
                      <SelectItem key={cls} value={cls.toString()}>
                        Class {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Select onValueChange={(value) => setValue("subject", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "math",
                      "english",
                      "science",
                      "urdu",
                      "islamiat",
                      "computer",
                      "physics",
                      "chemistry",
                      "biology",
                    ].map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub.charAt(0).toUpperCase() + sub.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  {...register("topic", { required: true })}
                  placeholder="Enter topic name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Additional Details</Label>
                <Textarea
                  id="details"
                  {...register("details")}
                  placeholder="Any specific points to cover..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes Type</Label>
                <Select
                  onValueChange={(value) => setValue("notesType", value)}
                  defaultValue="comprehensive"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="bullet">Bullet Points</SelectItem>
                    <SelectItem value="qa">Q&A Format</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <LoadingSpinner className="mr-2" /> Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" /> Generate Notes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generated Notes</CardTitle>
            <CardDescription>
              {generatedNotes
                ? generatedNotes.topic
                : "Your AI-generated notes will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">
                  Generating study notes...
                </p>
              </div>
            ) : generatedNotes ? (
              <div
                ref={notesRef}
                className="prose prose-sm max-w-none dark:prose-invert"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {generatedNotes.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Notes Generated</h3>
                <p className="text-muted-foreground">
                  Configure settings and click "Generate Notes" to create
                  AI-powered study notes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
