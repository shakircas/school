"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileKey, Loader2, Copy, Printer } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export function SolutionManual({ paperContent, subject, classLevel }) {
  const [loading, setLoading] = useState(false);
  const [solutions, setSolutions] = useState(null);

  const generateSolutions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "solution-manual",
          //   subject,
          //   class: classLevel,
          details: paperContent, // Passing the paper content to AI
        }),
      });

      if (response.status === 429) {
        toast.error(
          "Google's free limit reached. Please wait a minute before trying again!"
        );
        return;
      }
      const result = await res.json();
      setSolutions(result.paper.content);
      toast.success("Marking Scheme Generated!");
    } catch (error) {
      toast.error("Failed to generate solutions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6 print:hidden">
      {!solutions ? (
        <Button
          onClick={generateSolutions}
          disabled={loading}
          className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-100"
        >
          {loading ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <FileKey className="mr-2 w-6 h-6" />
          )}
          Generate Marking Scheme & Solutions
        </Button>
      ) : (
        <Card className="border-2 border-emerald-100 bg-emerald-50/30 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="font-black text-xl tracking-tight">
                Teacher's Marking Guide
              </h3>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-emerald-500 rounded-lg"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-emerald-500 rounded-lg"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardContent className="p-8 prose prose-emerald max-w-none">
            <ReactMarkdown>{solutions}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
