"use client"

import { useState } from "react"
import useSWR from "swr"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Plus, Download, Trophy } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function ResultsContent() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedExam, setSelectedExam] = useState("")
  const { data: results, isLoading, mutate } = useSWR("/api/results", fetcher)
  const { data: students } = useSWR("/api/students", fetcher)
  const { data: exams } = useSWR("/api/exams", fetcher)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to add result")

      toast.success("Result added successfully")
      setIsAddOpen(false)
      reset()
      mutate()
    } catch (error) {
      toast.error("Failed to add result")
    }
  }

  const exportResults = async () => {
    try {
      const response = await fetch(`/api/results?export=csv&class=${selectedClass}&exam=${selectedExam}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "results.csv"
      a.click()
      toast.success("Results exported successfully")
    } catch (error) {
      toast.error("Failed to export results")
    }
  }

  const getGradeBadge = (percentage) => {
    if (percentage >= 90) return <Badge className="bg-green-500">A+</Badge>
    if (percentage >= 80) return <Badge className="bg-green-400">A</Badge>
    if (percentage >= 70) return <Badge className="bg-blue-500">B</Badge>
    if (percentage >= 60) return <Badge className="bg-yellow-500">C</Badge>
    if (percentage >= 50) return <Badge className="bg-orange-500">D</Badge>
    return <Badge variant="destructive">F</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const filteredResults =
    results?.data?.filter((result) => {
      if (selectedClass && result.student?.class !== selectedClass) return false
      if (selectedExam && result.exam?._id !== selectedExam) return false
      return true
    }) || []

  return (
    <div className="space-y-6">
      <PageHeader title="Exam Results" description="View and manage student examination results">
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportResults}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Result
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Exam Result</DialogTitle>
                <DialogDescription>Enter student examination results</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select onValueChange={(value) => setValue("student", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.data?.map((student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.name} - Class {student.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Exam</Label>
                  <Select onValueChange={(value) => setValue("exam", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams?.data?.map((exam) => (
                        <SelectItem key={exam._id} value={exam._id}>
                          {exam.name} - Class {exam.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="obtainedMarks">Obtained Marks</Label>
                    <Input id="obtainedMarks" type="number" {...register("obtainedMarks", { required: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input id="totalMarks" type="number" {...register("totalMarks", { required: true })} />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Result</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
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
            <div className="w-48">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="All Exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {exams?.data?.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>Student examination results</CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredResults.length ? (
            <EmptyState
              icon={Trophy}
              title="No results found"
              description="Add exam results to view them here"
              action={
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Result
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Obtained</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => {
                  const percentage = ((result.obtainedMarks / result.totalMarks) * 100).toFixed(1)
                  return (
                    <TableRow key={result._id}>
                      <TableCell className="font-medium">{result.student?.name}</TableCell>
                      <TableCell>Class {result.student?.class}</TableCell>
                      <TableCell>{result.exam?.name}</TableCell>
                      <TableCell>{result.obtainedMarks}</TableCell>
                      <TableCell>{result.totalMarks}</TableCell>
                      <TableCell>{percentage}%</TableCell>
                      <TableCell>{getGradeBadge(Number.parseFloat(percentage))}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
