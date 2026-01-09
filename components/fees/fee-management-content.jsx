"use client";

import { use, useState } from "react";
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
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Download,
  Plus,
  CreditCard,
  Banknote,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json());

const statuses = ["All", "Paid", "Partial", "Pending", "Overdue"];
const paymentMethods = ["Cash", "Card", "Bank Transfer", "Cheque", "Online"];
const classColorMap = {
  "Class 1": "bg-blue-100 text-blue-700 border-blue-200",
  "Class 2": "bg-green-100 text-green-700 border-green-200",
  "Class 3": "bg-purple-100 text-purple-700 border-purple-200",
  "Class 4": "bg-pink-100 text-pink-700 border-pink-200",
  "Class 5": "bg-amber-100 text-amber-700 border-amber-200",
  "Class 6": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Class 7": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Class 8": "bg-rose-100 text-rose-700 border-rose-200",
  "Class 9": "bg-teal-100 text-teal-700 border-teal-200",
  "Class 10": "bg-orange-100 text-orange-700 border-orange-200",
};

export function FeeManagementContent() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState("2024-2025");
  const [filterMonth, setFilterMonth] = useState("all");

  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    academicYear: "2024-2025",
    month: "",
    dueDate: "",
    classId: "",
    sectionId: "",
  });

  const query = new URLSearchParams({
    academicYear: filterAcademicYear,
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filterMonth !== "all") query.append("month", filterMonth);
  if (classFilter !== "all") query.append("classId", classFilter);
  if (statusFilter !== "All") query.append("status", statusFilter);
  if (search) query.append("search", search);

  const { data, isLoading, mutate } = useSWR(
    `/api/fees?${query.toString()}`,
    fetcher
  );

  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  console.log("fees Data", data);
  const classes = classesRes?.data || [];
  const feeList = data?.data || [];
  const meta = data?.meta || {};

  console.log(feeList);

  // Filter fees
  const filteredFees = feeList;

  // Calculate stats
  const totalCollected = feeList.reduce(
    (sum, f) => sum + (f.paidAmount || 0),
    0
  );

  const totalPending = feeList.reduce((sum, f) => sum + (f.dueAmount || 0), 0);

  const overdueCount = feeList.filter((f) => f.status === "Overdue").length;

  const paidCount = feeList.filter((f) => f.status === "Paid").length;

  const openPaymentDialog = (fee) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.dueAmount.toString());
    setIsPaymentDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedFee || !paymentAmount) return;

    const amount = Number.parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    if (amount > selectedFee.dueAmount) {
      toast({
        title: "Amount exceeds due",
        description: "Payment amount cannot exceed the due amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      await fetch(`/api/fees/${selectedFee._id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMethod,
          collectedBy: "Admin",
        }),
      });

      toast({
        title: "Payment Successful",
        description: `Receipt No: RCP-${Date.now().toString().slice(-6)}`,
      });
      setIsPaymentDialogOpen(false);
      setSelectedFee(null);
      setPaymentAmount("");
      mutate();
    } catch (error) {
      toast({ title: "Payment failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      Paid: { variant: "default", className: "bg-green-500" },
      Partial: { variant: "secondary", className: "bg-amber-500 text-white" },
      Pending: { variant: "outline", className: "" },
      Overdue: { variant: "destructive", className: "" },
    };
    const { className } = config[status] || config.Pending;
    return <Badge className={className}>{status}</Badge>;
  };

  const printReceipt = (fee) => {
    toast({
      title: "Printing Receipt",
      description: `Receipt for ${fee.studentName}`,
    });
  };

  const getClassBadge = (className, section) => {
    const color =
      classColorMap[className] || "bg-gray-100 text-gray-700 border-gray-200";

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}
      >
        {className} – {section}
      </span>
    );
  };

  const handleFeeExport = async (format) => {
    try {
      const query = new URLSearchParams({
        academicYear: filterAcademicYear,
      });

      if (filterMonth !== "all") query.append("month", filterMonth);
      if (classFilter !== "all") query.append("classId", classFilter);
      if (statusFilter !== "All") query.append("status", statusFilter);
      if (search) query.append("search", search);

      const res = await fetch(`/api/reports/fees/export?${query.toString()}`);
      const { rows } = await res.json();

      if (!rows || rows.length === 0) {
        toast({ title: "No data to export", variant: "destructive" });
        return;
      }

      const filename = `fee-report-${filterAcademicYear}-${filterMonth}`;

      if (format === "excel") {
        exportToExcel(rows, filename, "Fees");
      } else if (format === "csv") {
        exportToCSV(rows, filename);
      } else if (format === "pdf") {
        generateFeeReportPDF(rows).save(`${filename}.pdf`);
      }
    } catch (err) {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        description="Collect fees and manage student payments"
      >
        <div className="flex items-center gap-2">
          <Select onValueChange={(v) => handleFeeExport(v)}>
            <SelectTrigger className="w-[140px]">
              <Download className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              const query = new URLSearchParams({
                academicYear: filterAcademicYear,
              });

              if (filterMonth !== "all") query.append("month", filterMonth);
              if (classFilter !== "all") query.append("classId", classFilter);
              if (statusFilter !== "All") query.append("status", statusFilter);

              window.open(`/api/admin/fees/register-pdf?${query.toString()}`);
            }}
          >
            Download Fee Register
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Monthly Fees
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate Monthly Fees</DialogTitle>
                <DialogDescription>
                  Fees will be generated for all active students based on fee
                  structure.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                {/* Academic Year */}
                <div>
                  <Label>Academic Year</Label>
                  <Input
                    value={form.academicYear}
                    onChange={(e) =>
                      setForm({ ...form, academicYear: e.target.value })
                    }
                  />
                </div>

                {/* Month */}
                <div>
                  <Label>Month</Label>
                  <Select
                    value={form.month}
                    onValueChange={(v) => setForm({ ...form, month: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
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
                      ].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                  />
                </div>

                {/* Class */}
                <div>
                  <Label>Class (Optional)</Label>
                  <Select
                    value={form.classId}
                    onValueChange={(v) => setForm({ ...form, classId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Section (optional)</Label>
                  <Select
                    value={form.sectionId || ""}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, sectionId: v || "all" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {classes
                        .find((c) => c._id === form.classId)
                        ?.sections.map((s) => (
                          <SelectItem key={s._id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>

                <Button
                  disabled={loading}
                  onClick={async () => {
                    if (!form.month || !form.dueDate) {
                      toast({
                        title: "Missing fields",
                        variant: "destructive",
                      });
                      return;
                    }

                    setLoading(true);
                    console.log(form);

                    const res = await fetch("/api/admin/fees/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(form),
                    });

                    const data = await res.json();

                    setLoading(false);
                    setOpen(false);

                    toast({
                      title: "Monthly Fees Generated",
                      description: `Created: ${data.created}, Skipped: ${data.skipped}`,
                    });

                    mutate();
                  }}
                >
                  {loading ? "Generating..." : "Generate Fees"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  Rs. {totalCollected.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  Rs. {totalPending.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/20">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {overdueCount} Students
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-500/20">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fully Paid</p>
                <p className="text-2xl font-bold text-primary">
                  {paidCount} Students
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/20">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Academic Year */}
            <Select
              value={filterAcademicYear}
              onValueChange={(v) => {
                setPage(1);
                setFilterAcademicYear(v);
              }}
            >
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

            {/* Month */}
            <Select
              value={filterMonth}
              onValueChange={(v) => {
                setPage(1);
                setFilterMonth(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {[
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
                ].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Class */}
            <Select
              value={classFilter}
              onValueChange={(v) => {
                setPage(1);
                setClassFilter(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setPage(1);
                setStatusFilter(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>{filteredFees.length} records found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Installments</TableHead>
                    {/* <TableHead>version</TableHead> */}
                    <TableHead className="text-right">Total Fee</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map((fee) => (
                    <TableRow
                      key={fee._id}
                      className="hover:bg-muted/40 transition relative"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {fee.studentName
                                .split(" ")
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
                        {getClassBadge(fee.classId.name, fee.sectionId)}
                      </TableCell>

                      <TableCell>{fee.month}</TableCell>
                      <TableCell>{fee.academicYear}</TableCell>
                      <TableCell>
                        {fee.installments?.map((ins, i) => (
                          <div
                            key={i}
                            className={`text-xs flex items-center gap-1 ${
                              ins.locked
                                ? "text-green-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span>
                              Inst {i + 1}: Rs.{" "}
                              {ins.amount -
                                (fee.discount + fee.scholarship - fee.fine) / 2}
                            </span>
                            {ins.fine > 0 && (
                              <span className="text-red-600">
                                (Fine Rs.{ins.fine})
                              </span>
                            )}
                            {ins.locked && (
                              <Badge variant="success">Locked</Badge>
                            )}
                          </div>
                        ))}
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          Rs. {fee.totalAmount.toLocaleString()}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                          Rs. {fee.paidAmount.toLocaleString()}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                            fee.dueAmount > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          Rs. {fee.dueAmount.toLocaleString()}
                        </span>
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(fee.status)}
                        {/* {fee?.inst.locked && <Badge variant="success">Locked</Badge>} */}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {fee.status !== "Paid" && (
                            <Button
                              size="sm"
                              onClick={() => openPaymentDialog(fee)}
                              // disabled={fee?.inst.locked}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => printReceipt(fee)}
                          >
                            <Printer className="h-4 w-4" />
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
                            onClick={() => router.push(`/fees/${fee._id}`)}
                          >
                            <Eye className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Collect Fee Payment</DialogTitle>
            <DialogDescription>
              Review installments and collect payment safely
            </DialogDescription>
          </DialogHeader>

          {selectedFee && (
            <div className="space-y-5">
              {/* STUDENT + SUMMARY */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/40">
                <div>
                  <p className="text-xs text-muted-foreground">Student</p>
                  <p className="font-medium">{selectedFee.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    Roll #{selectedFee.rollNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Total Fee</p>
                  <p className="font-semibold">
                    Rs. {selectedFee.totalAmount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Remaining Due</p>
                  <p className="font-semibold text-amber-600">
                    Rs. {selectedFee.dueAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* SCHOLARSHIP INFO */}
              {selectedFee.scholarship?.value > 0 && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                  🎓 Scholarship Applied:{" "}
                  <strong>
                    {selectedFee.scholarship.type === "percentage"
                      ? `${selectedFee.scholarship.value}%`
                      : `Rs. ${selectedFee.scholarship.value}`}
                  </strong>
                </div>
              )}

              {/* INSTALLMENT BREAKDOWN */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Installment Breakdown</h4>

                <div className="border rounded-md divide-y">
                  {selectedFee.installments.map((inst, idx) => {
                    const instDue =
                      inst.amount + (inst.fine || 0) - inst.paidAmount;

                    return (
                      <div
                        key={idx}
                        className={`p-3 flex items-center justify-between ${
                          inst.locked ? "bg-green-50" : "bg-background"
                        }`}
                      >
                        <div className="text-sm space-y-0.5">
                          <p className="font-medium">Installment {idx + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            Amount: Rs. {inst.amount}
                            {inst.fine > 0 && (
                              <span className="text-red-600">
                                {" "}
                                + Fine Rs.{inst.fine}
                              </span>
                            )}
                          </p>
                          <p className="text-xs">Paid: Rs. {inst.paidAmount}</p>
                        </div>

                        <div className="text-right">
                          {inst.locked ? (
                            <Badge className="bg-green-600 text-white">
                              Paid & Locked 🔒
                            </Badge>
                          ) : (
                            <Badge variant="outline">Due: Rs. {instDue}</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PAYMENT INPUT */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>
                    Payment Amount
                    <span className="text-xs text-muted-foreground ml-1">
                      (Auto-applied to installments)
                    </span>
                  </Label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* WARNING / LOCK INFO */}
              {selectedFee.installments.every((i) => i.locked) && (
                <div className="text-sm text-green-600 font-medium">
                  ✅ All installments are fully paid and locked.
                </div>
              )}
            </div>
          )}

          {/* FOOTER */}
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handlePayment}
              disabled={
                isProcessing || selectedFee?.installments.every((i) => i.locked)
              }
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4 mr-2" />
                  Collect Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
