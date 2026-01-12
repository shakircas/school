"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FileSpreadsheet, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToExcel } from "@/lib/excel-utils";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function FeeDownloadsContent() {
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [selectAcademicYear, setSelectAcademicYear] = useState("all");

  const query = new URLSearchParams({
    classId: selectedClass,
    status: selectedStatus,
    academicYear: selectAcademicYear,
  }).toString();

  const { data: fees, isLoading } = useSWR(`/api/fees?${query}`, fetcher);

  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const classes = classesRes?.data || [];
  console.log(fees);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  const handleExport = async (format) => {
    if (!fees?.data?.length) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);
    try {
      const data = fees?.data?.map((fee) => ({
        "Student Name": fee.student?.name || "",
        "Roll Number": fee.student?.rollNumber || "",
        Class: fee.student?.classId || fee.classId.name,
        "Fee Type": fee.feeType || "Tuition",

        "Payment Method": fee.paymentMethod || "Cash",
        "Receipt No": fee.payments[0]?.receiptNumber || "",
        "Total Amount": fee.totalAmount || 0,
        "Discount etc": (fee.discount || 0) + (fee.scholarship || 0),
        Fine: fee.fine || 0,
        Amount: fee.netAmount || 0,

        "Paid Amount": fee.paidAmount || 0,
        Balance: (fee.netAmount || 0) - (fee.paidAmount || 0),
        Status: fee.status,
        "Due Date": fee.dueDate
          ? new Date(fee.dueDate).toLocaleDateString()
          : "",
      }));

      if (format === "csv") {
        exportToCSV(data, `fee_report_${selectedClass}`);
      } else {
        exportToExcel(data, `fee_report_${selectedClass}`);
      }

      toast.success(`Exported ${data.length} records`);
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Download Fee Reports"
        description="Export fee collection and pending reports"
      />

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
                  {classes?.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name}
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
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select
                value={selectAcademicYear}
                onValueChange={setSelectAcademicYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Academic Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Academic Years</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2022-2023">2022-2023</SelectItem>
                  <SelectItem value="2021-2022">2021-2022</SelectItem>
                  <SelectItem value="2020-2021">2020-2021</SelectItem>
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
            <Button
              className="w-full"
              onClick={() => handleExport("csv")}
              disabled={isExporting || isLoading}
            >
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
  );
}
