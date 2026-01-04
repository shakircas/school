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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        description="Collect fees and manage student payments"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
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
                      setForm((p) => ({ ...p, sectionId: v || null }))
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
                    <TableRow key={fee._id}>
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
                        {fee.classId.name}-{fee.sectionName}
                      </TableCell>
                      <TableCell>{fee.month}</TableCell>
                      <TableCell className="text-right font-medium">
                        Rs. {fee.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        Rs. {fee.paidAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-amber-600 font-medium">
                        Rs. {fee.dueAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {fee.status !== "Paid" && (
                            <Button
                              size="sm"
                              onClick={() => openPaymentDialog(fee)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription>
              Process fee payment for {selectedFee?.studentName}
            </DialogDescription>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Fee</p>
                  <p className="font-semibold">
                    Rs. {selectedFee.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Amount</p>
                  <p className="font-semibold text-amber-600">
                    Rs. {selectedFee.dueAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Amount</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing}>
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
