import { MainLayout } from "@/components/layout/main-layout"
import { NotificationsContent } from "@/components/notifications/notifications-content"

export const metadata = {
  title: "Notifications | EduManage",
  description: "Manage school notifications and announcements",
}

export default function NotificationsPage() {
  return (
    <MainLayout>
      <NotificationsContent />
    </MainLayout>
  )
}
