"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Save } from "lucide-react";

/* ----------------------------------------
   AI Correct Answer Normalizer
---------------------------------------- */
const normalizeCorrectAnswer = (options, correctAnswer) => {
  if (typeof correctAnswer === "number") return correctAnswer;

  const map = { A: 0, B: 1, C: 2, D: 3 };
  if (map[correctAnswer] !== undefined) return map[correctAnswer];

  const idx = options.findIndex(
    (o) => o.trim() === String(correctAnswer).trim()
  );

  return idx !== -1 ? idx : 0;
};

export default function AddMCQPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      class: "9",
      subject: "",
      chapter: "",
      topic: "",
      difficulty: "medium",
      language: "English",
      explanation: "",
    },
  });

  const options = watch("options");
  const correctAnswer = watch("correctAnswer");

  /* ----------------------------------------
     AI Generate Single MCQ
  ---------------------------------------- */
  const generateFromAI = async () => {
    const subject = watch("subject");
    const classLevel = watch("class");
    const language = watch("language");

    if (!subject || !classLevel) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Select class and subject first",
      });
      return;
    }

    setLoadingAI(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "mcqs",
          subject,
          class: classLevel,
          count: 1,
          language,
        }),
      });

      const data = await res.json();
      const q = data?.questions?.[0];
      if (!q) throw new Error("AI returned no question");

      setValue("question", q.question);
      setValue("options", q.options);

      const normalized = normalizeCorrectAnswer(q.options, q.correctAnswer);
      setValue("correctAnswer", normalized);
      setValue("explanation", q.explanation || "");

      toast({ title: "AI MCQ Generated" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: err.message,
      });
    } finally {
      setLoadingAI(false);
    }
  };

  /* ----------------------------------------
     Save MCQ
  ---------------------------------------- */
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        options: data.options.map(String),
        correctAnswer: Number(data.correctAnswer),
        marks: 1,
      };

      const res = await fetch("/api/mcqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save MCQ");

      toast({ title: "MCQ Saved Successfully" });
      reset();
      router.push("/mcqs");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Add MCQ</CardTitle>
          <Button
            type="button"
            variant="secondary"
            onClick={generateFromAI}
            disabled={loadingAI}
          >
            {loadingAI ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            AI Generate
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Meta */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Class</Label>
              <Select
                value={watch("class")}
                onValueChange={(v) => setValue("class", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[6, 7, 8, 9, 10].map((c) => (
                    <SelectItem key={c} value={String(c)}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <div>
              <Label>Subject</Label>
              <Input {...register("subject", { required: true })} />
            </div> */}

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={watch("subject")}
                onValueChange={(v) => setValue("subject", v)}
              >
                {" "}
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="urdu">Urdu</SelectItem>
                  <SelectItem value="islamiat">Islamiat</SelectItem>
                  <SelectItem value="computer">Computer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Difficulty</Label>
              <Select
                value={watch("difficulty")}
                onValueChange={(v) => setValue("difficulty", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Language */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Language</Label>
              <Select
                value={watch("language")}
                onValueChange={(v) => setValue("language", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Urdu">Urdu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Chapter</Label>
              <Input {...register("chapter")} />
            </div>
          </div>

          {/* Question */}
          <div>
            <Label>Question</Label>
            <Textarea rows={3} {...register("question", { required: true })} />
            {errors.question && (
              <p className="text-sm text-destructive">Question is required</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Options (select correct)</Label>
            <RadioGroup
              value={String(correctAnswer)}
              onValueChange={(v) => setValue("correctAnswer", Number(v))}
            >
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <RadioGroupItem value={String(i)} />
                  <Input
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    {...register(`options.${i}`, { required: true })}
                  />
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Explanation */}
          <div>
            <Label>Explanation (optional)</Label>
            <Textarea {...register("explanation")} rows={2} />
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save MCQ
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
