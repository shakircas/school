import { MainLayout } from "@/components/layout/main-layout"
import { AIPapersContent } from "@/components/ai/ai-papers-content"
import { AIWorksheetContent } from "@/components/ai/ai-worksheet-content"

export const metadata = {
  title: "AI Paper Generator | EduManage",
  description: "Generate exam papers using AI",
}

export default function AIWorksheetPage() {
  return (
    <MainLayout>
      <AIWorksheetContent />
    </MainLayout>
  )
}
