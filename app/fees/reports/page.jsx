import { MainLayout } from "@/components/layout/main-layout"
import { FeeReportsContent } from "@/components/fees/fee-reports-content"

export const metadata = {
  title: "Fee Reports | EduManage Pro",
}

export default function FeeReportsPage() {
  return (
    <MainLayout>
      <FeeReportsContent />
    </MainLayout>
  )
}
