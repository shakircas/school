"use client";

import { useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Plus,
  Bell,
  Trash2,
  Send,
  Users,
  Calendar,
  Info,
  AlertTriangle,
  CheckCircle2,
  Megaphone,
  Search,
  Filter,
  Clock,
  ChevronRight,
  BarChart3,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const fetcher = (url) => fetch(url).then((res) => res.json());

// Schema Constants
const NOTIFICATION_TYPES = [
  "Info",
  "Warning",
  "Success",
  "Error",
  "Announcement",
];
const CATEGORIES = [
  "General",
  "Fee",
  "Exam",
  "Assignment",
  "Attendance",
  "Result",
  "Event",
];
const RECIPIENTS = ["All", "Students", "Teachers", "Parents"];

export function NotificationsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null); // For Read Receipt Modal
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: notifications,
    isLoading,
    mutate,
  } = useSWR("/api/notifications", fetcher);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      type: "Info",
      category: "General",
      recipients: "All",
      status: "Active",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();
      toast.success("Broadcast sent successfully");
      setIsCreateOpen(false);
      reset();
      mutate();
    } catch (error) {
      toast.error("Failed to deliver notification");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Notification deleted");
        mutate();
      }
    } catch (error) {
      toast.error("Error deleting notification");
    }
  };

  const filteredNotifications =
    notifications?.filter(
      (n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getTypeStyles = (type) => {
    switch (type) {
      case "Warning":
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-200",
        };
      case "Success":
        return {
          icon: <CheckCircle2 className="h-5 w-5" />,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
        };
      case "Error":
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          color: "text-rose-600",
          bg: "bg-rose-50",
          border: "border-rose-200",
        };
      case "Announcement":
        return {
          icon: <Megaphone className="h-5 w-5" />,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
          border: "border-indigo-200",
        };
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-200",
        };
    }
  };

  if (isLoading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Dynamic Header Section */}
      <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Notification Center
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage campus-wide broadcasts and alerts
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-indigo-500"
            />
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-bold transition-all active:scale-95">
                <Plus className="h-5 w-5 mr-2" />
                New Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-8 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-slate-800">
                  New Notification
                </DialogTitle>
                <DialogDescription className="font-medium">
                  Reach your school community instantly.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5 pt-4"
              >
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                    Title
                  </Label>
                  <Input
                    {...register("title", { required: true })}
                    placeholder="Main heading..."
                    className="h-12 rounded-xl bg-slate-50 border-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                    Message Content
                  </Label>
                  <Textarea
                    {...register("message", { required: true })}
                    placeholder="Write your message here..."
                    rows={4}
                    className="rounded-xl bg-slate-50 border-slate-100 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                      Visual Tone
                    </Label>
                    <Select
                      onValueChange={(v) => setValue("type", v)}
                      defaultValue="Info"
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {NOTIFICATION_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                      Category
                    </Label>
                    <Select
                      onValueChange={(v) => setValue("category", v)}
                      defaultValue="General"
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 pb-4">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                    Target Recipients
                  </Label>
                  <Select
                    onValueChange={(v) => setValue("recipients", v)}
                    defaultValue="All"
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {RECIPIENTS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl bg-indigo-600 text-lg font-black shadow-lg shadow-indigo-100"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" /> Send Broadcast
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Feed Section */}
      {!filteredNotifications.length ? (
        <EmptyState
          icon={Bell}
          title="No active alerts"
          description="Everything is quiet for now. Start by creating a new notification."
        />
      ) : (
        <div className="grid gap-4">
          {filteredNotifications.map((n) => {
            const styles = getTypeStyles(n.type);
            const readCount = n.readBy?.length || 0;
            return (
              <Card
                key={n._id}
                className="group border-none shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 rounded-[2rem] overflow-hidden bg-white"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Status Accent Bar (Responsive) */}
                    <div
                      className={`w-full sm:w-2 h-2 sm:h-auto ${styles.bg.replace(
                        "50",
                        "400"
                      )}`}
                    />

                    <div className="flex-1 p-6 flex flex-col sm:flex-row items-start gap-6">
                      {/* Icon Circle */}
                      <div
                        className={`shrink-0 p-4 rounded-3xl ${styles.bg} ${styles.color} border-2 ${styles.border} shadow-sm`}
                      >
                        {styles.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-800">
                              {n.title}
                            </h3>
                            <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] uppercase px-2">
                              {n.category}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            {/* Read Receipt Summary Trigger */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl hover:bg-indigo-50 text-indigo-600 font-bold text-xs gap-2"
                              onClick={() => setSelectedNotification(n)}
                            >
                              <Eye className="h-4 w-4" />
                              {readCount} {readCount === 1 ? "Read" : "Reads"}
                              <ChevronRight className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                              onClick={() => handleDelete(n._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed font-medium">
                          {n.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-50">
                          <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(n.createdAt), "MMM d, h:mm a")}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                            <Users className="h-3.5 w-3.5" />
                            To: {n.recipients}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Read Receipts Detail Modal */}
      <Dialog
        open={!!selectedNotification}
        onOpenChange={() => setSelectedNotification(null)}
      >
        <DialogContent className="rounded-[2.5rem] sm:max-w-md border-none p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Delivery Report
            </DialogTitle>
            <DialogDescription className="font-medium">
              Tracking readers for:{" "}
              <span className="text-indigo-600 font-bold">
                {selectedNotification?.title}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {selectedNotification?.readBy?.length > 0 ? (
              selectedNotification.readBy.map((receipt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                      <Users className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                      {/* Note: This assumes 'user' is populated with { name, role } from your API */}
                      <p className="font-bold text-slate-800 text-sm">
                        {receipt.user?.name || "Anonymous User"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {receipt.user?.role || "Staff/Student"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      Seen
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {format(new Date(receipt.readAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium italic">
                  No read receipts yet.
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={() => setSelectedNotification(null)}
            className="w-full rounded-2xl bg-slate-900 h-12 font-bold"
          >
            Close Report
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
