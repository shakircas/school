import { MainLayout } from "@/components/layout/main-layout"
import { FeeStructureContent } from "@/components/fees/fee-structure-content"

export const metadata = {
  title: "Fee Structure | EduManage Pro",
}

export default function FeeStructurePage() {
  return (
    <MainLayout>
      <FeeStructureContent />
    </MainLayout>
  )
}
