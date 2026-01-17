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
  FileCheck,
  Printer,
  Download,
  Copy,
  Grid,
  ListTodo,
  ImageIcon,
  HelpCircle,
  Zap,
  Scissors,
  PencilRuler,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AIWorksheetContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorksheet, setGeneratedWorksheet] = useState(null);
  const worksheetRef = useRef(null);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      class: "9",
      subject: "Physics",
      format: "Mixed Assessment",
      difficulty: "Medium",
    },
  });

  const onSubmit = async (data) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "worksheet", ...data }),
      });

      if (response.status === 429) {
        toast.error(
          "Google's free limit reached. Please wait a minute before trying again!"
        );
        return;
      }

      const result = await response.json();
      if (result.worksheet) {
        setGeneratedWorksheet(result.worksheet);
        toast.success("Worksheet Built Successfully!");
      }
    } catch (error) {
      toast.error("Failed to build worksheet.");
    } finally {
      setIsGenerating(false);
    }
  };

  console.log(generatedWorksheet);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <PencilRuler className="text-rose-500 w-8 h-8" />
            Worksheet <span className="text-rose-500">Studio</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
            Activity & Assessment Builder for BISE Curriculum
          </p>
        </div>

        {generatedWorksheet && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="rounded-xl font-black border-2 border-slate-200"
            >
              <Printer className="w-4 h-4 mr-2" /> Print Handout
            </Button>
            <Button className="bg-rose-500 hover:bg-rose-600 rounded-xl font-black shadow-lg shadow-rose-100">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Builder Sidebar */}
        <Card className="xl:col-span-4 border-2 border-slate-100 shadow-xl rounded-[2.5rem] overflow-hidden self-start">
          <div className="bg-rose-500 p-6 text-white flex items-center gap-3">
            <Scissors className="w-5 h-5 text-rose-200" />
            <h3 className="font-black">Design Settings</h3>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Grade Level
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
                        Grade {c}
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

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Worksheet Type
                </Label>
                <Select
                  onValueChange={(v) => setValue("format", v)}
                  defaultValue="Mixed Assessment"
                >
                  <SelectTrigger className="rounded-xl border-2 font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matching Columns" className="font-bold">
                      Matching Columns (Terms & Definitions)
                    </SelectItem>
                    <SelectItem value="Diagram Labeling" className="font-bold">
                      Diagram Labeling Prompt
                    </SelectItem>
                    <SelectItem value="Short Answers" className="font-bold">
                      Short Question Bank
                    </SelectItem>
                    <SelectItem value="Mixed Assessment" className="font-bold">
                      Comprehensive Mixed Bag
                    </SelectItem>
                    <SelectItem
                      value="Practical Observation"
                      className="font-bold"
                    >
                      Lab/Practical Log
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Topic / Specific Concept
                </Label>
                <Input
                  {...register("topic", { required: true })}
                  placeholder="e.g. Newton's Laws of Motion"
                  className="rounded-xl border-2 font-bold h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Medium">Standard</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Time Limit
                  </Label>
                  <Input
                    type="text"
                    {...register("time")}
                    placeholder="20 mins"
                    className="rounded-xl border-2 font-bold"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 font-black text-lg gap-3 shadow-lg shadow-rose-100 transition-all active:scale-95"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                Create Handout
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Worksheet Preview */}
        <Card className="xl:col-span-8 border-2 border-slate-100 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden min-h-[800px] print:border-0 print:shadow-none">
          {isGenerating && (
            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem]">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-t-4 border-indigo-600 animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-8 h-8 animate-pulse" />
              </div>
              <p className="mt-6 text-xl font-black text-slate-900 animate-pulse">
                Generating Worksheet...
              </p>
              <p className="text-slate-400 font-bold">
                This usually takes 15-20 seconds for a full worksheet.
              </p>
            </div>
          )}
          {generatedWorksheet ? (
            <CardContent className="p-10 md:p-16">
              {/* Institutional Header (For Print) */}
              <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">
                    Classroom Activity
                  </h2>
                  <p className="text-sm font-bold text-slate-500">
                    Subject: {watch("subject")} | Topic: {watch("topic")}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="w-48 h-8 border-2 border-slate-200 rounded-lg flex items-center px-2 text-[10px] font-black text-slate-400">
                    STUDENT NAME:
                  </div>
                  <div className="w-48 h-8 border-2 border-slate-200 rounded-lg flex items-center px-2 text-[10px] font-black text-slate-400">
                    ROLL NO:
                  </div>
                </div>
              </div>

              <div
                ref={worksheetRef}
                className="prose prose-slate max-w-none prose-headings:font-black prose-p:font-bold prose-p:text-slate-700"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {generatedWorksheet.content}
                </ReactMarkdown>
              </div>

              {/* Answer Key (Optional section at bottom) */}
              <div className="mt-20 pt-10 border-t-2 border-dashed border-slate-200 print:break-before-page">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  Teacher's Answer Key (Detachable)
                </h4>
                <div className="bg-slate-50 p-6 rounded-2xl text-sm font-bold text-slate-600 leading-relaxed italic">
                  {generatedWorksheet.answerKey}
                </div>
              </div>
            </CardContent>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-40">
              <div className="bg-rose-50 p-12 rounded-full mb-8">
                <Grid className="w-20 h-20 text-rose-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Sheet Canvas Empty
              </h3>
              <p className="font-bold text-slate-400 uppercase text-xs tracking-widest mt-2">
                Pick a format and let AI build the questions
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
