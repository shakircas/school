"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/page-header"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2, Save, ArrowLeft, Wand2 } from "lucide-react"
import { toast } from "sonner"

export function CreateQuizContent() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      class: "",
      subject: "",
      duration: 30,
      questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  })

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: "active" }),
      })

      if (!response.ok) throw new Error("Failed to create quiz")

      toast.success("Quiz created successfully")
      router.push("/quizzes")
    } catch (error) {
      toast.error("Failed to create quiz")
    }
  }

  const handleGenerateQuestions = async () => {
    const subject = watch("subject")
    const classLevel = watch("class")

    if (!subject || !classLevel) {
      toast.error("Please select class and subject first")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quiz",
          subject,
          class: classLevel,
          count: 5,
        }),
      })

      const result = await response.json()

      if (result.questions) {
        result.questions.forEach((q) => {
          append({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })
        })
        toast.success("Questions generated successfully")
      }
    } catch (error) {
      toast.error("Failed to generate questions")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Create Quiz" description="Create a new quiz for students">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>Basic information about the quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter quiz title"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" type="number" {...register("duration")} placeholder="30" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Quiz description and instructions"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select onValueChange={(value) => setValue("class", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
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
                <Select onValueChange={(value) => setValue("subject", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="urdu">Urdu</SelectItem>
                    <SelectItem value="islamiat">Islamiat</SelectItem>
                    <SelectItem value="computer">Computer</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Add quiz questions with multiple choice answers</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={handleGenerateQuestions} disabled={isGenerating}>
                <Wand2 className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "AI Generate"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-start justify-between">
                  <Label className="text-lg font-medium">Question {index + 1}</Label>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Textarea
                    {...register(`questions.${index}.question`, { required: true })}
                    placeholder="Enter your question"
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Options</Label>
                  <RadioGroup
                    defaultValue={field.correctAnswer?.toString()}
                    onValueChange={(value) => setValue(`questions.${index}.correctAnswer`, Number.parseInt(value))}
                  >
                    {[0, 1, 2, 3].map((optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3">
                        <RadioGroupItem value={optIndex.toString()} id={`q${index}-opt${optIndex}`} />
                        <Input
                          {...register(`questions.${index}.options.${optIndex}`, { required: true })}
                          placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">Select the correct answer</p>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ question: "", options: ["", "", "", ""], correctAnswer: 0 })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        </div>
      </form>
    </div>
  )
}
