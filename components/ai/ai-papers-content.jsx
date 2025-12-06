"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Wand2, Download, Printer, FileText, Copy } from "lucide-react"
import { toast } from "sonner"

export function AIPapersContent() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPaper, setGeneratedPaper] = useState(null)
  const paperRef = useRef(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      class: "",
      subject: "",
      examType: "midterm",
      totalMarks: "100",
      duration: "3 hours",
      topics: "",
      questionTypes: "mcq,short,long",
    },
  })

  const onSubmit = async (data) => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "paper",
          ...data,
        }),
      })

      const result = await response.json()

      if (result.paper) {
        setGeneratedPaper(result.paper)
        toast.success("Paper generated successfully!")
      } else {
        throw new Error("Failed to generate paper")
      }
    } catch (error) {
      toast.error("Failed to generate paper. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopy = () => {
    if (generatedPaper) {
      navigator.clipboard.writeText(generatedPaper.content)
      toast.success("Copied to clipboard!")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="AI Paper Generator" description="Generate exam papers using Gemini AI">
        {generatedPaper && (
          <div className="flex gap-2">
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
              Download PDF
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Paper Settings</CardTitle>
            <CardDescription>Configure your exam paper</CardDescription>
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
                    <SelectItem value="computer">Computer Science</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Select onValueChange={(value) => setValue("examType", value)} defaultValue="midterm">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly Test</SelectItem>
                    <SelectItem value="monthly">Monthly Test</SelectItem>
                    <SelectItem value="midterm">Mid-term</SelectItem>
                    <SelectItem value="final">Final Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input id="totalMarks" {...register("totalMarks")} placeholder="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" {...register("duration")} placeholder="3 hours" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topics">Topics (Optional)</Label>
                <Textarea
                  id="topics"
                  {...register("topics")}
                  placeholder="Enter specific topics to cover, separated by commas"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Question Types</Label>
                <div className="flex flex-wrap gap-2">
                  {["MCQ", "Short Q", "Long Q", "Fill in Blanks", "True/False"].map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Paper
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Paper Preview</CardTitle>
            <CardDescription>
              {generatedPaper ? "Your generated exam paper" : "Configure settings and generate a paper"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">Generating your exam paper with AI...</p>
              </div>
            ) : generatedPaper ? (
              <div ref={paperRef} className="prose prose-sm max-w-none dark:prose-invert">
                <div className="text-center mb-8 pb-4 border-b">
                  <h1 className="text-2xl font-bold mb-1">EduManage School</h1>
                  <h2 className="text-lg mb-2">{generatedPaper.title}</h2>
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                    <span>Class: {generatedPaper.class}</span>
                    <span>Subject: {generatedPaper.subject}</span>
                    <span>Total Marks: {generatedPaper.totalMarks}</span>
                    <span>Time: {generatedPaper.duration}</span>
                  </div>
                </div>
                <div className="whitespace-pre-wrap">{generatedPaper.content}</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Paper Generated</h3>
                <p className="text-muted-foreground max-w-sm">
                  Configure your paper settings on the left and click "Generate Paper" to create an AI-powered exam
                  paper.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
