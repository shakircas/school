"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Edit, Trash2, FileQuestion, Search, Wand2 } from "lucide-react";
import { toast } from "sonner";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function MCQsContent() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMCQ, setSelectedMCQ] = useState(null);
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: mcqs, isLoading, mutate } = useSWR("/api/mcqs", fetcher);
  console.log(mcqs)
  const normalizeCorrectAnswer = (options, correctAnswer) => {
    // Case 1: AI returned index already
    if (typeof correctAnswer === "number") {
      return correctAnswer;
    }

    // Case 2: AI returned "A" | "B" | "C" | "D"
    const letterMap = { A: 0, B: 1, C: 2, D: 3 };
    if (letterMap[correctAnswer] !== undefined) {
      return letterMap[correctAnswer];
    }

    // Case 3: AI returned option value like "$69"
    const index = options.findIndex(
      (opt) => opt.trim() === String(correctAnswer).trim()
    );

    return index !== -1 ? index : 0; // fallback
  };


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 2,
      class: "1",
      subject: "math",
      difficulty: "medium",
    },
  });

  const onSubmit = async (data) => {
    try {
      const method = selectedMCQ ? "PUT" : "POST";
      const url = selectedMCQ ? `/api/mcqs/${selectedMCQ._id}` : "/api/mcqs";

      const normalizedData = {
        ...data,
        options: Array.isArray(data.options)
          ? data.options.map(String)
          : ["", "", "", ""],
        correctAnswer: Number(data.correctAnswer),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedData),
      });

      if (!response.ok) throw new Error("Failed to save MCQ");

      toast.success(
        selectedMCQ ? "MCQ updated successfully" : "MCQ added successfully"
      );
      setIsAddOpen(false);
      setSelectedMCQ(null);
      reset();
      mutate();
    } catch (error) {
      toast.error("Failed to save MCQ");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await fetch(`/api/mcqs/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete MCQ");
      toast.success("MCQ deleted successfully");
      mutate();
    } catch (error) {
      toast.error("Failed to delete MCQ");
    }
  };

  const handleEdit = (mcq) => {
    setSelectedMCQ(mcq);
    reset(mcq);
    setIsAddOpen(true);
  };

  const handleAIGenerate = async () => {
    const subject = watch("subject");
    const classLevel = watch("class");

    if (!subject || !classLevel) {
      toast.error("Please select class and subject first");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "mcqs",
          subject,
          class: classLevel,
          count: 1,
          language: "English",
        }),
      });

      const result = await response.json();
      console.log(result);
      if (result.questions?.[0]) {
        const q = result.questions[0];

        setValue("question", q.question);
        setValue("options", q.options);

        const correctIndex = normalizeCorrectAnswer(q.options, q.correctAnswer);

        setValue("correctAnswer", correctIndex);

        toast.success("Question generated!");
      }

    } catch (error) {
      toast.error("Failed to generate question");
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const variants = {
      easy: "secondary",
      medium: "default",
      hard: "destructive",
    };
    return (
      <Badge variant={variants[difficulty] || "secondary"}>{difficulty}</Badge>
    );
  };

  const filteredMCQs =
    mcqs?.filter((mcq) => {
      if (filterClass && mcq.class !== filterClass) return false;
      if (filterSubject && mcq.subject !== filterSubject) return false;
      if (
        searchQuery &&
        !mcq.question.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="MCQ Question Bank"
        description="Manage multiple choice questions for practice"
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/mcqs/practice">
              <FileQuestion className="h-4 w-4 mr-2" />
              Practice Mode
            </Link>
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedMCQ(null);
                  reset({
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: 0,
                    class: "1",
                    subject: "math",
                    difficulty: "medium",
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedMCQ ? "Edit Question" : "Add New Question"}
                </DialogTitle>
                <DialogDescription>
                  {selectedMCQ
                    ? "Update the MCQ question"
                    : "Add a new MCQ to the question bank"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select
                      onValueChange={(value) => setValue("class", value)}
                      defaultValue={selectedMCQ?.class || "1"}
                    >
                      {" "}
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => (
                          <SelectItem key={cls} value={cls.toString()}>
                            Class {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select
                      onValueChange={(value) => setValue("subject", value)}
                      defaultValue={selectedMCQ?.subject || "math"}
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
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      onValueChange={(value) => setValue("difficulty", value)}
                      defaultValue={selectedMCQ?.difficulty || "medium"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Question</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAIGenerate}
                      disabled={isGenerating}
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      {isGenerating ? "Generating..." : "AI Generate"}
                    </Button>
                  </div>
                  <Textarea
                    {...register("question", {
                      required: "Question is required",
                    })}
                    placeholder="Enter the question"
                    rows={3}
                  />
                  {errors.question && (
                    <p className="text-sm text-destructive">
                      {errors.question.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Options (Select correct answer)</Label>
                  <RadioGroup
                    defaultValue={selectedMCQ?.correctAnswer?.toString() || "0"}
                    onValueChange={(value) =>
                      setValue("correctAnswer", Number.parseInt(value))
                    }
                  >
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index} className="flex items-center gap-3">
                        <RadioGroupItem
                          value={index.toString()}
                          id={`mcq-opt-${index}`}
                        />
                        <Input
                          {...register(`options.${index}`, { required: true })}
                          placeholder={`Option ${String.fromCharCode(
                            65 + index
                          )}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedMCQ ? "Update" : "Add Question"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mcqs?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mcqs?.filter((m) => m.difficulty === "easy").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Easy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mcqs?.filter((m) => m.difficulty === "medium").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Medium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mcqs?.filter((m) => m.difficulty === "hard").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Hard</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-36">
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => (
                    <SelectItem key={cls} value={cls.toString()}>
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-36">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="urdu">Urdu</SelectItem>
                  <SelectItem value="islamiat">Islamiat</SelectItem>
                  <SelectItem value="computer">Computer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({filteredMCQs.length})</CardTitle>
          <CardDescription>Browse and manage MCQ questions</CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredMCQs.length ? (
            <EmptyState
              icon={FileQuestion}
              title="No questions found"
              description="Add your first MCQ question to get started"
              action={
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Question</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMCQs.map((mcq) => (
                  <TableRow key={mcq._id}>
                    <TableCell className="font-medium">
                      <p className="line-clamp-2">{mcq.question}</p>
                    </TableCell>
                    <TableCell>Class {mcq.class}</TableCell>
                    <TableCell className="capitalize">{mcq.subject}</TableCell>
                    <TableCell>{getDifficultyBadge(mcq.difficulty)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {String.fromCharCode(65 + mcq.correctAnswer)}.{" "}
                        {mcq.options[mcq.correctAnswer]?.substring(0, 20)}...
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(mcq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(mcq._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
