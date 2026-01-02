"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Search,
  Download,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function PendingFeesContent() {
  const { toast } = useToast();

  // 🔎 Filters
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [month, setMonth] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  // 🔗 Query builder (USES SAME /api/fees)
  const query = new URLSearchParams({
    academicYear,
    status: "Pending" && "Partial", // 🔥 forced as requested
  });

  if (month !== "all") query.append("month", month);
  if (classFilter !== "all") query.append("classId", classFilter);
  if (search) query.append("search", search);

  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const classes = classesRes?.data || [];

  const { data, isLoading } = useSWR(`/api/fees?${query.toString()}`, fetcher);

  const fees = data?.data || [];

  // 📊 Stats
  const totalPending = fees.reduce((s, f) => s + (f.dueAmount || 0), 0);
  const overdueCount = fees.filter((f) => f.status === "Overdue").length;

  // 📩 Actions
  const sendReminder = (type, fee) => {
    toast({
      title: `${type} Reminder Sent`,
      description: `Reminder sent to ${fee.studentName}`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Fees"
        description="Students with unpaid or partially paid fees"
      >
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* 📊 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <DollarSign className="h-6 w-6 text-amber-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                Rs. {totalPending.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {overdueCount} Students
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <Clock className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold text-primary">{fees.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔎 Filters */}
      <Card>
        <CardContent className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={academicYear} onValueChange={setAcademicYear}>
            <SelectTrigger>
              <SelectValue placeholder="Academic Year" />
            </SelectTrigger>
            <SelectContent>
              {["2023-2024", "2024-2025", "2025-2026"].map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes?.map((c) => (
                <SelectItem key={c._id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 📋 Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Fee Records</CardTitle>
          <CardDescription>Unpaid & partially paid students</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {fees.map((fee) => (
                    <TableRow key={fee._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {fee.studentName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {fee.studentName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Roll #{fee.rollNumber}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {fee.className}-{fee.sectionName}
                      </TableCell>

                      <TableCell className="text-right text-amber-600 font-bold">
                        Rs. {fee.dueAmount.toLocaleString()}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            fee.status === "Overdue"
                              ? "bg-red-500 text-white"
                              : "bg-amber-500 text-white"
                          }
                        >
                          {fee.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => sendReminder("SMS", fee)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => sendReminder("Email", fee)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              window.open(
                                `/api/fees/legal-notice?feeId=${fee._id}`
                              );
                            }}
                          >
                            <FileText className="h-4 w-4 text-red-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={async () => {
                              await fetch("/api/notifications/whatsapp", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ feeId: fee._id }),
                              });
                              toast({ title: "WhatsApp reminder sent" });
                            }}
                          >
                            <MessageSquare className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
