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
import { Calendar, Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function ExamsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const { data: exams, isLoading, mutate } = useSWR("/api/exams", fetcher)
  const { data: classes } = useSWR("/api/classes", fetcher)
  const { data: subjects } = useSWR("/api/subjects", fetcher)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      const method = selectedExam ? "PUT" : "POST"
      const url = selectedExam ? `/api/exams/${selectedExam._id}` : "/api/exams"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save exam")

      toast.success(selectedExam ? "Exam updated successfully" : "Exam created successfully")
      setIsCreateOpen(false)
      setSelectedExam(null)
      reset()
      mutate()
    } catch (error) {
      toast.error("Failed to save exam")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this exam?")) return

    try {
      const response = await fetch(`/api/exams/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete exam")
      toast.success("Exam deleted successfully")
      mutate()
    } catch (error) {
      toast.error("Failed to delete exam")
    }
  }

  const handleEdit = (exam) => {
    setSelectedExam(exam)
    reset(exam)
    setIsCreateOpen(true)
  }

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: "secondary",
      ongoing: "default",
      completed: "outline",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Examinations" description="Manage exams, schedules, and results">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedExam(null)
                reset({})
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedExam ? "Edit Exam" : "Create New Exam"}</DialogTitle>
              <DialogDescription>
                {selectedExam ? "Update exam details" : "Schedule a new examination"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Exam Name</Label>
                  <Input
                    id="name"
                    {...register("name", { required: "Exam name is required" })}
                    placeholder="Mid-term Examination"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select onValueChange={(value) => setValue("examType", value)} defaultValue={selectedExam?.examType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midterm">Mid-term</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="monthly">Monthly Test</SelectItem>
                      <SelectItem value="weekly">Weekly Test</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select onValueChange={(value) => setValue("class", value)} defaultValue={selectedExam?.class}>
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
                  <Label htmlFor="subject">Subject</Label>
                  <Select onValueChange={(value) => setValue("subject", value)} defaultValue={selectedExam?.subject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.data?.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </SelectItem>
                      )) || (
                        <>
                          <SelectItem value="math">Mathematics</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="urdu">Urdu</SelectItem>
                          <SelectItem value="islamiat">Islamiat</SelectItem>
                          <SelectItem value="computer">Computer</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Exam Date</Label>
                  <Input id="date" type="date" {...register("date", { required: "Date is required" })} />
                  {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="time" {...register("startTime")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="time" {...register("endTime")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    {...register("totalMarks", { required: true })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passingMarks">Passing Marks</Label>
                  <Input id="passingMarks" type="number" {...register("passingMarks")} placeholder="33" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description / Instructions</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Exam instructions and guidelines"
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{selectedExam ? "Update Exam" : "Create Exam"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Exam Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{exams?.data?.filter((e) => e.status === "scheduled").length || 0}</div>
            <p className="text-sm text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{exams?.data?.filter((e) => e.status === "ongoing").length || 0}</div>
            <p className="text-sm text-muted-foreground">Ongoing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{exams?.data?.filter((e) => e.status === "completed").length || 0}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{exams?.data?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Exams</p>
          </CardContent>
        </Card>
      </div>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Examinations</CardTitle>
          <CardDescription>View and manage all scheduled examinations</CardDescription>
        </CardHeader>
        <CardContent>
          {!exams?.data?.length ? (
            <EmptyState
              icon={Calendar}
              title="No exams scheduled"
              description="Create your first examination to get started"
              action={
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Exam
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.data.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell className="capitalize">{exam.examType}</TableCell>
                    <TableCell>Class {exam.class}</TableCell>
                    <TableCell className="capitalize">{exam.subject}</TableCell>
                    <TableCell>{new Date(exam.date).toLocaleDateString()}</TableCell>
                    <TableCell>{exam.totalMarks}</TableCell>
                    <TableCell>{getStatusBadge(exam.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(exam)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(exam._id)}>
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
  )
}
