import { MainLayout } from "@/components/layout/main-layout"
import { ResultsContent } from "@/components/exams/results-content"

export const metadata = {
  title: "Exam Results | EduManage",
  description: "View and manage examination results",
}

export default function ResultsPage() {
  return (
    <MainLayout>
      <ResultsContent />
    </MainLayout>
  )
}
