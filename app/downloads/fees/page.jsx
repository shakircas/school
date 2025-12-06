import { MainLayout } from "@/components/layout/main-layout"
import { FeeDownloadsContent } from "@/components/downloads/fee-downloads-content"

export const metadata = {
  title: "Download Fee Reports | EduManage",
  description: "Export fee collection reports",
}

export default function FeeDownloadsPage() {
  return (
    <MainLayout>
      <FeeDownloadsContent />
    </MainLayout>
  )
}
