"use client"

import { use } from "react"
import useSWR from "swr"
import { MainLayout } from "@/components/layout/main-layout"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { StudentProfile } from "@/components/students/student-profile"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Edit, ArrowLeft } from "lucide-react"

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function StudentDetailPage({ params }) {
  const { id } = use(params)
  const { data: student, isLoading } = useSWR(`/api/students/${id}`, fetcher)

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingPage />
      </MainLayout>
    )
  }

  if (!student || student.error) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Student not found</h2>
          <Button asChild className="mt-4">
            <Link href="/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <PageHeader
        title={student.name}
        description={`Roll No: ${student.rollNumber} | Class ${student.class}-${student.section}`}
      >
        <Button asChild>
          <Link href={`/students/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Student
          </Link>
        </Button>
      </PageHeader>
      <StudentProfile student={student} />
    </MainLayout>
  )
}
