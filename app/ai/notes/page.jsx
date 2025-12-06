import { MainLayout } from "@/components/layout/main-layout"
import { AINotesContent } from "@/components/ai/ai-notes-content"

export const metadata = {
  title: "AI Notes Generator | EduManage",
  description: "Generate study notes using AI",
}

export default function AINotesPage() {
  return (
    <MainLayout>
      <AINotesContent />
    </MainLayout>
  )
}
