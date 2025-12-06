"use client"

import { useState } from "react"
import useSWR from "swr"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Plus, Edit, Trash2, School, Users } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function ClassesContent() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const { data: classes, isLoading, mutate } = useSWR("/api/classes", fetcher)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      const method = selectedClass ? "PUT" : "POST"
      const url = selectedClass ? `/api/classes/${selectedClass._id}` : "/api/classes"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save class")

      toast.success(selectedClass ? "Class updated" : "Class added")
      setIsAddOpen(false)
      setSelectedClass(null)
      reset()
      mutate()
    } catch (error) {
      toast.error("Failed to save class")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this class?")) return

    try {
      await fetch(`/api/classes/${id}`, { method: "DELETE" })
      toast.success("Class deleted")
      mutate()
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const handleEdit = (cls) => {
    setSelectedClass(cls)
    reset(cls)
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
      <PageHeader title="Classes" description="Manage school classes and sections">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedClass(null)
                reset({})
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedClass ? "Edit Class" : "Add New Class"}</DialogTitle>
              <DialogDescription>
                {selectedClass ? "Update class details" : "Add a new class to the school"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Class name is required" })}
                  placeholder="e.g., Class 1, Class 10"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sections">Sections (comma separated)</Label>
                <Input id="sections" {...register("sections")} placeholder="A, B, C" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classTeacher">Class Teacher</Label>
                <Input id="classTeacher" {...register("classTeacher")} placeholder="Teacher name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity per Section</Label>
                <Input id="capacity" type="number" {...register("capacity")} placeholder="40" />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{selectedClass ? "Update" : "Add Class"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>Manage class structure and sections</CardDescription>
        </CardHeader>
        <CardContent>
          {!classes?.data?.length ? (
            <EmptyState
              icon={School}
              title="No classes added"
              description="Add your first class to get started"
              action={
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Class
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Class Teacher</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.data.map((cls) => (
                  <TableRow key={cls._id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.sections || "A, B"}</TableCell>
                    <TableCell>{cls.classTeacher || "-"}</TableCell>
                    <TableCell>{cls.capacity || 40}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {cls.studentCount || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cls)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cls._id)}>
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
