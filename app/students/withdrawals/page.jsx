import { MainLayout } from "@/components/layout/main-layout"
import { WithdrawalsContent } from "@/components/students/withdrawals-content"

export const metadata = {
  title: "Withdrawals | EduManage",
  description: "Manage student withdrawals",
}

export default function WithdrawalsPage() {
  return (
    <MainLayout>
      <WithdrawalsContent />
    </MainLayout>
  )
}
