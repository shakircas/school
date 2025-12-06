"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/ui/page-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FileSpreadsheet, FileText, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { exportToCSV, exportToExcel } from "@/lib/excel-utils"

const fetcher = (url) => fetch(url).then((res) => res.json())

export function FeeDownloadsContent() {
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isExporting, setIsExporting] = useState(false)

  const { data: fees, isLoading } = useSWR("/api/fees", fetcher)

  const handleExport = async (format) => {
    if (!fees?.data?.length) {
      toast.error("No data to export")
      return
    }

    setIsExporting(true)
    try {
      let filteredData = fees.data

      if (selectedClass !== "all") {
        filteredData = filteredData.filter((f) => f.student?.class === selectedClass)
      }
      if (selectedStatus !== "all") {
        filteredData = filteredData.filter((f) => f.status === selectedStatus)
      }

      const data = filteredData.map((fee) => ({
        "Student Name": fee.student?.name || "",
        "Roll Number": fee.student?.rollNumber || "",
        Class: fee.student?.class || "",
        "Fee Type": fee.feeType || "Tuition",
        Amount: fee.amount || 0,
        "Paid Amount": fee.paidAmount || 0,
        Balance: (fee.amount || 0) - (fee.paidAmount || 0),
        Status: fee.status || "pending",
        "Due Date": fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "",
        "Payment Date": fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : "",
      }))

      if (format === "csv") {
        exportToCSV(data, `fee_report_${selectedClass}`)
      } else {
        exportToExcel(data, `fee_report_${selectedClass}`)
      }

      toast.success(`Exported ${data.length} records`)
    } catch (error) {
      toast.error("Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Download Fee Reports" description="Export fee collection and pending reports" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Filter Data</CardTitle>
            <CardDescription>Select criteria for export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => (
                    <SelectItem key={cls} value={cls.toString()}>
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading && <LoadingSpinner />}

            <div className="pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{fees?.data?.length || 0} records found</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>Download fee reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => handleExport("csv")} disabled={isExporting || isLoading}>
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>

            <Button
              className="w-full bg-transparent"
              variant="outline"
              onClick={() => handleExport("excel")}
              disabled={isExporting || isLoading}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Included Fields:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Student Name & Roll Number</li>
                <li>Fee Type & Amount</li>
                <li>Paid Amount & Balance</li>
                <li>Status & Dates</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
