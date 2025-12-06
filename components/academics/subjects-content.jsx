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
import { Plus, Edit, Trash2, BookOpen } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function SubjectsContent() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const { data: subjects, isLoading, mutate } = useSWR("/api/subjects", fetcher)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      const method = selectedSubject ? "PUT" : "POST"
      const url = selectedSubject ? `/api/subjects/${selectedSubject._id}` : "/api/subjects"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save subject")

      toast.success(selectedSubject ? "Subject updated" : "Subject added")
      setIsAddOpen(false)
      setSelectedSubject(null)
      reset()
      mutate()
    } catch (error) {
      toast.error("Failed to save subject")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this subject?")) return

    try {
      await fetch(`/api/subjects/${id}`, { method: "DELETE" })
      toast.success("Subject deleted")
      mutate()
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const handleEdit = (subject) => {
    setSelectedSubject(subject)
    reset(subject)
    setIsAddOpen(true)
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
      <PageHeader title="Subjects" description="Manage school subjects and curriculum">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedSubject(null)
                reset({})
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
              <DialogDescription>
                {selectedSubject ? "Update subject details" : "Add a new subject to the curriculum"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Subject name is required" })}
                  placeholder="e.g., Mathematics, English"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Subject Code</Label>
                <Input id="code" {...register("code")} placeholder="e.g., MATH101" />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  onValueChange={(value) => setValue("type", value)}
                  defaultValue={selectedSubject?.type || "compulsory"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compulsory">Compulsory</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                    <SelectItem value="optional">Optional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classes">For Classes (comma separated)</Label>
                <Input id="classes" {...register("classes")} placeholder="1, 2, 3, 4, 5" />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{selectedSubject ? "Update" : "Add Subject"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>All Subjects</CardTitle>
          <CardDescription>School curriculum subjects</CardDescription>
        </CardHeader>
        <CardContent>
          {!subjects?.data?.length ? (
            <EmptyState
              icon={BookOpen}
              title="No subjects added"
              description="Add your first subject to get started"
              action={
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.data.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.code || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={subject.type === "compulsory" ? "default" : "secondary"}>
                        {subject.type || "compulsory"}
                      </Badge>
                    </TableCell>
                    <TableCell>{subject.classes || "All"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(subject)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(subject._id)}>
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
