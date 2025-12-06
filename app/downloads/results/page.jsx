import { MainLayout } from "@/components/layout/main-layout"
import { ResultsDownloadsContent } from "@/components/downloads/results-downloads-content"

export const metadata = {
  title: "Download Results | EduManage",
  description: "Export exam results and reports",
}

export default function ResultsDownloadsPage() {
  return (
    <MainLayout>
      <ResultsDownloadsContent />
    </MainLayout>
  )
}
