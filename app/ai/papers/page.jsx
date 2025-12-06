import { MainLayout } from "@/components/layout/main-layout"
import { AIPapersContent } from "@/components/ai/ai-papers-content"

export const metadata = {
  title: "AI Paper Generator | EduManage",
  description: "Generate exam papers using AI",
}

export default function AIPapersPage() {
  return (
    <MainLayout>
      <AIPapersContent />
    </MainLayout>
  )
}
