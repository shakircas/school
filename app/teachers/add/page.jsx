"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/ui/page-header"
import { TeacherForm } from "@/components/forms/teacher-form"
import { useToast } from "@/hooks/use-toast"

export default function AddTeacherPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data) => {
    setIsLoading(true)

    try {
      // Process subjects from comma-separated string
      if (data.subjectsText) {
        data.subjects = data.subjectsText.split(",").map((s) => s.trim())
        delete data.subjectsText
      }

      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Teacher added",
          description: "The teacher has been added successfully.",
        })
        router.push("/teachers")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to add teacher")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <PageHeader title="Add New Teacher" description="Fill in the details to add a new teacher" />
      <TeacherForm onSubmit={handleSubmit} isLoading={isLoading} />
    </MainLayout>
  )
}
