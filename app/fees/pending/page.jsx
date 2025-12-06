import { MainLayout } from "@/components/layout/main-layout"
import { PendingFeesContent } from "@/components/fees/pending-fees-content"

export const metadata = {
  title: "Pending Fees | EduManage Pro",
}

export default function PendingFeesPage() {
  return (
    <MainLayout>
      <PendingFeesContent />
    </MainLayout>
  )
}
