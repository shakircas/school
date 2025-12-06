"use client"

import { useState } from "react"
import useSWR from "swr"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Edit, Trash2, FileText, Calendar, Users, Clock, Eye } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function AssignmentsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const { data: assignments, isLoading, mutate } = useSWR("/api/assignments", fetcher)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      const method = selectedAssignment ? "PUT" : "POST"
      const url = selectedAssignment ? `/api/assignments/${selectedAssignment._id}` : "/api/assignments"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save assignment")

      toast.success(selectedAssignment ? "Assignment updated" : "Assignment created")
      setIsCreateOpen(false)
      setSelectedAssignment(null)
      reset()
      mutate()
    } catch (error) {
      toast.error("Failed to save assignment")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this assignment?")) return

    try {
      await fetch(`/api/assignments/${id}`, { method: "DELETE" })
      toast.success("Assignment deleted")
      mutate()
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment)
    reset(assignment)
    setIsCreateOpen(true)
  }

  const getStatusBadge = (status) => {
    const variants = {
      active: "default",
      draft: "secondary",
      completed: "outline",
      overdue: "destructive",
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
      <PageHeader title="Assignments" description="Create and manage student assignments">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedAssignment(null)
                reset({})
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedAssignment ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
              <DialogDescription>
                {selectedAssignment ? "Update assignment details" : "Create a new assignment for students"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter assignment title"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Assignment description and instructions"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select onValueChange={(value) => setValue("class", value)} defaultValue={selectedAssignment?.class}>
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
                  <Select
                    onValueChange={(value) => setValue("subject", value)}
                    defaultValue={selectedAssignment?.subject}
                  >
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" {...register("dueDate", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input id="totalMarks" type="number" {...register("totalMarks")} placeholder="100" />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{selectedAssignment ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{assignments?.data?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {assignments?.data?.filter((a) => a.status === "active").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {assignments?.data?.filter((a) => a.status === "completed").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {assignments?.data?.filter((a) => a.status === "overdue").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Grid */}
      {!assignments?.data?.length ? (
        <EmptyState
          icon={FileText}
          title="No assignments"
          description="Create your first assignment to get started"
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.data.map((assignment) => (
            <Card key={assignment._id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-1">{assignment.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {assignment.description || "No description"}
                    </CardDescription>
                  </div>
                  {getStatusBadge(assignment.status || "active")}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Class {assignment.class}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="capitalize">{assignment.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  {assignment.totalMarks && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{assignment.totalMarks} Marks</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(assignment)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(assignment._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Submissions
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
