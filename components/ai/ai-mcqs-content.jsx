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
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Wand2, Copy, Download, Printer, BookOpen } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export function AIMCQsContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMCQs, setGeneratedMCQs] = useState(null);
  const mcqRef = useRef(null);

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      class: "",
      subject: "",
      topic: "",
      count: 10,
      difficulty: "Medium",
    },
  });

  const onSubmit = async (data) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "mcqs",
          class: data.class,
          subject: data.subject,
          topic: data.topic || "Relevant syllabus",
          count: data.count || 10,
          difficulty: data.difficulty || "Medium",
        }),
      });

      const result = await response.json();

      if (result.questions) {
        setGeneratedMCQs(result.questions);
        toast.success("MCQs generated successfully!");
      } else {
        throw new Error("Failed to generate MCQs");
      }
    } catch (err) {
      toast.error("Failed to generate MCQs. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedMCQs) {
      // Format the MCQs into a human-readable text string
      const formattedText = generatedMCQs
        .map((mcq, index) => {
          // Start with the question number and the question text
          let questionText = `${index + 1}. ${mcq.question}\n`;

          // Add options, assuming options are an array of strings or objects with a value property
          if (mcq.options && Array.isArray(mcq.options)) {
            // You might need to adjust this part based on your exact 'mcq.options' structure
            const optionsText = mcq.options
              .map((option, i) => {
                // Convert option index (0, 1, 2, 3) to A, B, C, D
                const optionLetter = String.fromCharCode(65 + i);
                // Adjust 'option.text' to the correct property if necessary (e.g., 'option.value')
                return `  ${optionLetter}. ${option.text || option}\n`;
              })
              .join(""); // Join options without extra separators

            questionText += optionsText;
          }

          // Add the correct answer (optional, for reference)
          if (mcq.correctAnswer) {
            questionText += `Correct Answer: ${mcq.correctAnswer}\n`;
          }

          return questionText;
        })
        .join("\n"); // Separate each MCQ with an extra line break

      // Use the Clipboard API to write the plain text
      navigator.clipboard
        .writeText(formattedText)
        .then(() => {
          toast.success("MCQs copied to clipboard, ready for Word!");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          toast.error("Failed to copy text.");
        });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI MCQs Generator"
        description="Generate multiple choice questions for your syllabus"
      >
        {generatedMCQs && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <Card className="lg:col-span-1 shadow-lg border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>MCQs Settings</CardTitle>
            <CardDescription>Configure your MCQs generation</CardDescription>
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
                  {...register("topic")}
                  placeholder="Enter topic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="count">Number of Questions</Label>
                  <Input
                    id="count"
                    type="number"
                    {...register("count")}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    onValueChange={(value) => setValue("difficulty", value)}
                    defaultValue="Medium"
                  >
                    <SelectTrigger>
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

              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <LoadingSpinner className="mr-2" /> Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" /> Generate MCQs
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="lg:col-span-2 shadow-lg border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Generated MCQs</CardTitle>
            <CardDescription>
              {generatedMCQs
                ? "Preview of generated MCQs"
                : "Configure settings and generate MCQs"}
            </CardDescription>
          </CardHeader>
          <CardContent ref={mcqRef}>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">Generating MCQs...</p>
              </div>
            ) : generatedMCQs ? (
              <div className="space-y-6">
                {generatedMCQs.map((q, i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <p className="font-semibold mb-2">
                      Q{i + 1}:{" "}
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {q.question}
                      </ReactMarkdown>
                    </p>
                    <ul className="list-disc ml-5 space-y-1">
                      {q.options.map((opt, idx) => (
                        <li key={idx}>
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {opt}
                          </ReactMarkdown>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 font-medium">
                      Answer:{" "}
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {q.correctAnswer}
                      </ReactMarkdown>
                    </p>
                    <p className="text-muted-foreground italic mt-1">
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {q.explanation}
                      </ReactMarkdown>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No MCQs Generated</h3>
                <p className="text-muted-foreground">
                  Configure your settings and click "Generate MCQs" to see
                  results.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
