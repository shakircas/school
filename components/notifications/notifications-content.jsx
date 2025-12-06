"use client"

import { useState } from "react"
import useSWR from "swr"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { Plus, Bell, Trash2, Send, Users, Calendar } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function NotificationsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data: notifications, isLoading, mutate } = useSWR("/api/notifications", fetcher)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to send notification")

      toast.success("Notification sent successfully")
      setIsCreateOpen(false)
      reset()
      mutate()
    } catch (error) {
      toast.error("Failed to send notification")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this notification?")) return

    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      toast.success("Notification deleted")
      mutate()
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const getTypeBadge = (type) => {
    const variants = {
      announcement: "default",
      alert: "destructive",
      reminder: "secondary",
      info: "outline",
    }
    return <Badge variant={variants[type] || "secondary"}>{type}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Send announcements and notifications">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Notification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>Create a new announcement or notification</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Notification title"
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  {...register("message", { required: "Message is required" })}
                  placeholder="Enter your message"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select onValueChange={(value) => setValue("type", value)} defaultValue="announcement">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="info">Information</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select onValueChange={(value) => setValue("audience", value)} defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="teachers">Teachers Only</SelectItem>
                      <SelectItem value="parents">Parents Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {!notifications?.data?.length ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="Send your first notification"
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Notification
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {notifications.data.map((notification) => (
            <Card key={notification._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      {getTypeBadge(notification.type)}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {notification.audience || "Everyone"}
                      </span>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(notification._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
