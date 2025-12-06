"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Search, Download, Mail, MessageSquare, Phone, Clock, DollarSign } from "lucide-react"

const pendingFees = [
  {
    _id: "1",
    studentName: "Usman Ahmed",
    rollNumber: "003",
    class: "9",
    section: "B",
    fatherName: "Ahmed Khan",
    phone: "0300-1234567",
    dueAmount: 14000,
    dueDate: "2024-11-30",
    daysOverdue: 4,
    status: "Overdue",
  },
  {
    _id: "2",
    studentName: "Fatima Zahra",
    rollNumber: "004",
    class: "8",
    section: "A",
    fatherName: "Zaheer Abbas",
    phone: "0301-2345678",
    dueAmount: 13000,
    dueDate: "2024-11-25",
    daysOverdue: 9,
    status: "Overdue",
  },
  {
    _id: "3",
    studentName: "Sara Ali",
    rollNumber: "002",
    class: "10",
    section: "A",
    fatherName: "Ali Hassan",
    phone: "0302-3456789",
    dueAmount: 5000,
    dueDate: "2024-12-15",
    daysOverdue: 0,
    status: "Partial",
  },
  {
    _id: "4",
    studentName: "Hassan Raza",
    rollNumber: "005",
    class: "10",
    section: "B",
    fatherName: "Raza Khan",
    phone: "0303-4567890",
    dueAmount: 7500,
    dueDate: "2024-12-15",
    daysOverdue: 0,
    status: "Partial",
  },
  {
    _id: "5",
    studentName: "Imran Khan",
    rollNumber: "015",
    class: "7",
    section: "C",
    fatherName: "Khan Ali",
    phone: "0304-5678901",
    dueAmount: 12000,
    dueDate: "2024-12-10",
    daysOverdue: 0,
    status: "Pending",
  },
]

export function PendingFeesContent() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("all")

  const filteredFees = pendingFees.filter((fee) => {
    const matchesSearch =
      fee.studentName.toLowerCase().includes(search.toLowerCase()) || fee.rollNumber.includes(search)
    const matchesClass = classFilter === "all" || fee.class === classFilter
    return matchesSearch && matchesClass
  })

  const totalPending = filteredFees.reduce((sum, f) => sum + f.dueAmount, 0)
  const overdueCount = filteredFees.filter((f) => f.status === "Overdue").length

  const sendReminder = (type, fee) => {
    toast({
      title: `${type} Reminder Sent`,
      description: `Payment reminder sent to ${fee.fatherName} for ${fee.studentName}`,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pending Fees" description="View and manage overdue fee payments">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export List
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/20">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pending</p>
              <p className="text-2xl font-bold text-amber-600">Rs. {totalPending.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueCount} Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-primary">{filteredFees.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                  <SelectItem key={c} value={c.toString()}>
                    Class {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              Send All Reminders
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Fee Records</CardTitle>
          <CardDescription>Students with outstanding fee payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent Contact</TableHead>
                  <TableHead className="text-right">Due Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>
                      <div>
                        <p className="text-sm">{fee.fatherName}</p>
                        <p className="text-xs text-muted-foreground">{fee.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-amber-600">
                      Rs. {fee.dueAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{new Date(fee.dueDate).toLocaleDateString()}</p>
                        {fee.daysOverdue > 0 && <p className="text-xs text-red-600">{fee.daysOverdue} days overdue</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={fee.status === "Overdue" ? "destructive" : "secondary"}>{fee.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => sendReminder("SMS", fee)} title="Send SMS">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => sendReminder("Email", fee)}
                          title="Send Email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Call">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
