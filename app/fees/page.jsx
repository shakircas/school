import { MainLayout } from "@/components/layout/main-layout"
import { FeeManagementContent } from "@/components/fees/fee-management-content"

export const metadata = {
  title: "Fee Management - EduManage Pro",
  description: "Manage student fees and payments",
}

export default function FeesPage() {
  return (
    <MainLayout>
      <FeeManagementContent />
    </MainLayout>
  )
}
