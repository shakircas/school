"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
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
} from "lucide-react"

const fetcher = (url) => fetch(url).then((res) => res.json())

// Mock fee data
const mockFees = [
  {
    _id: "1",
    studentId: "s1",
    studentName: "Ahmed Khan",
    rollNumber: "001",
    class: "10",
    section: "A",
    totalFee: 15000,
    paidAmount: 15000,
    dueAmount: 0,
    status: "Paid",
    dueDate: "2024-12-15",
    lastPayment: "2024-12-01",
  },
  {
    _id: "2",
    studentId: "s2",
    studentName: "Sara Ali",
    rollNumber: "002",
    class: "10",
    section: "A",
    totalFee: 15000,
    paidAmount: 10000,
    dueAmount: 5000,
    status: "Partial",
    dueDate: "2024-12-15",
    lastPayment: "2024-11-20",
  },
  {
    _id: "3",
    studentId: "s3",
    studentName: "Usman Ahmed",
    rollNumber: "003",
    class: "9",
    section: "B",
    totalFee: 14000,
    paidAmount: 0,
    dueAmount: 14000,
    status: "Pending",
    dueDate: "2024-12-15",
    lastPayment: null,
  },
  {
    _id: "4",
    studentId: "s4",
    studentName: "Fatima Zahra",
    rollNumber: "004",
    class: "8",
    section: "A",
    totalFee: 13000,
    paidAmount: 0,
    dueAmount: 13000,
    status: "Overdue",
    dueDate: "2024-11-30",
    lastPayment: null,
  },
  {
    _id: "5",
    studentId: "s5",
    studentName: "Hassan Raza",
    rollNumber: "005",
    class: "10",
    section: "B",
    totalFee: 15000,
    paidAmount: 7500,
    dueAmount: 7500,
    status: "Partial",
    dueDate: "2024-12-15",
    lastPayment: "2024-11-15",
  },
  {
    _id: "6",
    studentId: "s6",
    studentName: "Ayesha Bibi",
    rollNumber: "006",
    class: "7",
    section: "A",
    totalFee: 12000,
    paidAmount: 12000,
    dueAmount: 0,
    status: "Paid",
    dueDate: "2024-12-15",
    lastPayment: "2024-12-05",
  },
]

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
const statuses = ["All", "Paid", "Partial", "Pending", "Overdue"]
const paymentMethods = ["Cash", "Card", "Bank Transfer", "Cheque", "Online"]

export function FeeManagementContent() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedFee, setSelectedFee] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    data: feesData,
    isLoading,
    mutate,
  } = useSWR("/api/fees", fetcher, {
    fallbackData: mockFees,
  })

  const feeList = Array.isArray(feesData) ? feesData : mockFees

  // Filter fees
  const filteredFees = feeList.filter((fee) => {
    const matchesSearch =
      fee.studentName.toLowerCase().includes(search.toLowerCase()) || fee.rollNumber.includes(search)
    const matchesClass = classFilter === "all" || fee.class === classFilter
    const matchesStatus = statusFilter === "All" || fee.status === statusFilter
    return matchesSearch && matchesClass && matchesStatus
  })

  // Calculate stats
  const totalCollected = feeList.reduce((sum, f) => sum + f.paidAmount, 0)
  const totalPending = feeList.reduce((sum, f) => sum + f.dueAmount, 0)
  const overdueCount = feeList.filter((f) => f.status === "Overdue").length
  const paidCount = feeList.filter((f) => f.status === "Paid").length

  const openPaymentDialog = (fee) => {
    setSelectedFee(fee)
    setPaymentAmount(fee.dueAmount.toString())
    setIsPaymentDialogOpen(true)
  }

  const handlePayment = async () => {
    if (!selectedFee || !paymentAmount) return

    const amount = Number.parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" })
      return
    }

    if (amount > selectedFee.dueAmount) {
      toast({
        title: "Amount exceeds due",
        description: "Payment amount cannot exceed the due amount",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Payment Successful",
        description: `Receipt No: RCP-${Date.now().toString().slice(-6)}`,
      })
      setIsPaymentDialogOpen(false)
      setSelectedFee(null)
      setPaymentAmount("")
      mutate()
    } catch (error) {
      toast({ title: "Payment failed", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      Paid: { variant: "default", className: "bg-green-500" },
      Partial: { variant: "secondary", className: "bg-amber-500 text-white" },
      Pending: { variant: "outline", className: "" },
      Overdue: { variant: "destructive", className: "" },
    }
    const { className } = config[status] || config.Pending
    return <Badge className={className}>{status}</Badge>
  }

  const printReceipt = (fee) => {
    toast({ title: "Printing Receipt", description: `Receipt for ${fee.studentName}` })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Fee Management" description="Collect fees and manage student payments">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Fee
          </Button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold text-green-600">Rs. {totalCollected.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-amber-600">Rs. {totalPending.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-red-600">{overdueCount} Students</p>
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
                <p className="text-2xl font-bold text-primary">{paidCount} Students</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
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
                            <p className="font-medium text-sm">{fee.studentName}</p>
                            <p className="text-xs text-muted-foreground">Roll #{fee.rollNumber}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {fee.class}-{fee.section}
                      </TableCell>
                      <TableCell className="text-right font-medium">Rs. {fee.totalFee.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-600">Rs. {fee.paidAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-amber-600 font-medium">
                        Rs. {fee.dueAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      <TableCell className="text-sm">{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {fee.status !== "Paid" && (
                            <Button size="sm" onClick={() => openPaymentDialog(fee)}>
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => printReceipt(fee)}>
                            <Printer className="h-4 w-4" />
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

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription>Process fee payment for {selectedFee?.studentName}</DialogDescription>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Fee</p>
                  <p className="font-semibold">Rs. {selectedFee.totalFee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Amount</p>
                  <p className="font-semibold text-amber-600">Rs. {selectedFee.dueAmount.toLocaleString()}</p>
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
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
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
  )
}
