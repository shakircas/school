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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/hooks/use-toast";
import { FileSpreadsheet, FileText, Users, Printer, Eye } from "lucide-react";
import { exportToExcel, exportToCSV } from "@/lib/excel-utils";
import { generateTeacherListPDF } from "@/lib/pdf-generator";
import { KP_DESIGNATIONS } from "../teachers/teachers-content";

const fetcher = (url) => fetch(url).then((res) => res.json());

const availableFields = [
  { id: "personalNo", label: "Personal No.", default: true }, // 👇 FIXED", label: "Employee ID", default: true },
  { id: "name", label: "Teacher Name", default: true },
  { id: "designation", label: "Designation", default: true },
  // { id: "department", label: "Department", default: true },
  { id: "phone", label: "Phone", default: true },
  { id: "email", label: "Email", default: true },
  { id: "qualification", label: "Qualification", default: false },
  { id: "experience", label: "Experience", default: false },
  { id: "joiningDate", label: "Joining Date", default: false },
  { id: "salary", label: "Salary", default: false },
  { id: "status", label: "Status", default: true },
];

export function TeacherDownloadsContent() {
  const { toast } = useToast();
  const [selectedDesignation, setSelectedDesignation] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [selectedFields, setSelectedFields] = useState(
    availableFields.filter((f) => f.default).map((f) => f.id)
  );
  const [isExporting, setIsExporting] = useState(false);

  const queryParams = new URLSearchParams({
    designation: selectedDesignation,
    status: selectedStatus,
  }).toString();

  // const { data: teachers, isLoading: isTeachersLoading } = useSWR(`/api/teachers?${queryParams}`, fetcher)

  const { data: teachersData, isLoading } = useSWR(
    `/api/teachers?${queryParams}`,
    fetcher
  );

  const teachers = teachersData?.teachers || [];
  if (!teachers) {
    return <div>Loading...</div>;
  }

  console.log(teachers);
  console.log(teachersData);
  const toggleField = (fieldId) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((f) => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const prepareExportData = () => {
    return teachers.map((teacher) => {
      const row = {};
      selectedFields.forEach((field) => {
        const fieldInfo = availableFields.find((f) => f.id === field);
        row[fieldInfo?.label || field] = teacher[field] || "-";
      });
      return row;
    });
  };

  const handleExport = async (format) => {
    if (!teachers.length) {
      toast({
        title: "No Data",
        description: "No teachers to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const data = prepareExportData();
      const filename = `teachers-${
        selectedDesignation === "all" ? "all" : selectedDesignation.toLowerCase()
      }-${new Date().toISOString().split("T")[0]}`;

      if (format === "excel") {
        exportToExcel(data, filename, "Teachers");
      } else if (format === "csv") {
        exportToCSV(data, filename);
      } else if (format === "pdf") {
        const doc = generateTeacherListPDF(teachers, {
          subtitle:
            selectedDesignation === "all"
              ? "All Departments"
              : `${selectedDesignation} Department`,
        });
        doc.save(`${filename}.pdf`);
      }

      toast({
        title: "Export Successful",
        description: `${
          teachers.length
        } teachers exported to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({ title: "Export Failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const departments = [
    ...new Set(
      (Array.isArray(teachers) ? teachers : [])
        .map((t) => t.department)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Download Teacher Data"
        description="Export teacher information in various formats"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Data</CardTitle>
            <CardDescription>Select which teachers to export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={selectedDesignation}
                onValueChange={setSelectedDesignation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designations</SelectItem>
                  {KP_DESIGNATIONS.map((designation) => (
                    <SelectItem key={designation} value={designation}>
                      {designation}
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{teachers.length}</strong>{" "}
                  teachers found
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Field Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Fields</CardTitle>
            <CardDescription>Choose fields to include</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {availableFields.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`teacher-${field.id}`}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <Label
                    htmlFor={`teacher-${field.id}`}
                    className="cursor-pointer text-sm"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              {selectedFields.length} fields selected
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Options</CardTitle>
            <CardDescription>Download in your preferred format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              onClick={() => handleExport("excel")}
              disabled={isExporting || isLoading}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Export as Excel
            </Button>

            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => handleExport("csv")}
              disabled={isExporting || isLoading}
            >
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Export as CSV
            </Button>

            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => handleExport("pdf")}
              disabled={isExporting || isLoading}
            >
              <Printer className="h-4 w-4 mr-2 text-red-600" />
              Export as PDF
            </Button>

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium">Export Summary</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Records: {teachers.length}</p>
                <p>Fields: {selectedFields.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>First 5 records</CardDescription>
            </div>
            <Badge variant="secondary">
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {selectedFields.map((field) => (
                    <th
                      key={field}
                      className="px-3 py-2 text-left font-medium text-muted-foreground"
                    >
                      {availableFields.find((f) => f.id === field)?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teachers && teachers.length > 0 && teachers.slice(0, 5).map((teacher, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    {selectedFields.map((field) => (
                      <td key={field} className="px-3 py-2">
                        {teacher[field] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
