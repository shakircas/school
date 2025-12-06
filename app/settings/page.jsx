import { MainLayout } from "@/components/layout/main-layout"
import { SettingsContent } from "@/components/settings/settings-content"

export const metadata = {
  title: "Settings | EduManage",
  description: "School management settings",
}

export default function SettingsPage() {
  return (
    <MainLayout>
      <SettingsContent />
    </MainLayout>
  )
}
