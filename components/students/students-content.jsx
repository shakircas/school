"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel, exportToCSV, importFromExcel } from "@/lib/excel-utils";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  GraduationCap,
} from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import { useStudents } from "../hooks/useStudents";
import { useDebounce } from "@/hooks/useDebounce";
import { generateStudentListPDF } from "@/lib/pdf-generator";
import { downloadStudentTemplate } from "@/lib/excel-templates";
import { ImportPreviewDialog } from "./import-preview-dialog";

const fetcher = (url) => fetch(url).then((res) => res.json());

const statuses = ["Active", "Inactive", "Graduated", "Transferred"];

export function StudentsContent() {

 const [previewData, setPreviewData] = useState([]);
 const [showPreview, setShowPreview] = useState(false);
 const [importFile, setImportFile] = useState(null);
 const [importResult, setImportResult] = useState(null);

  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (classFilter) queryParams.set("classId", classFilter);
  if (sectionFilter) queryParams.set("sectionId", sectionFilter);

  if (statusFilter) queryParams.set("status", statusFilter);

  queryParams.set("page", page);
  queryParams.set("limit", limit);

  useEffect(() => {
    setPage(1);
  }, [search, classFilter, sectionFilter, statusFilter]);

  const debouncedSearch = useDebounce(search, 300);

  if (debouncedSearch) {
    queryParams.set("search", debouncedSearch);
  }

  const params = useSearchParams();

  useEffect(() => {
    setSearch(params.get("search") || "");
    setClassFilter(params.get("classId") || "all");
    setSectionFilter(params.get("sectionId") || "all");
    setStatusFilter(params.get("status") || "Active");
    setPage(Number(params.get("page")) || 1);
  }, []);

  const getClassById = (classId) => classes?.find((c) => c._id === classId);

  const getSectionName = (classId, sectionId) => {
    const cls = getClassById(classId);
    return cls?.sections?.find((s) => s.name === sectionId)?.name;
  };

  const {
    data,
    isLoading: studentsLoading,
    mutate,
  } = useSWR(`/api/students?${queryParams.toString()}`, fetcher);
  // const { data: classes, isLoading: classesLoading } = useSWR(
  //   "/api/academics/classes",
  //   fetcher
  // );
  const { classes, classesLoading } = useClasses();
  console.log("classes", classes);
  const students = data?.students || [];
  // const { students, loading: studentsLoading } = useStudents();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Student deleted",
          description: "The student has been removed successfully.",
        });
        mutate();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  console.log("students", students);

  const handleExport = (format) => {
    const exportData = students.map((s) => ({
      "Roll Number": s.rollNumber,
      "Registration Number": s.registrationNumber,
      Name: s.name,
      Class: getClassById(s.classId)?.name,
      Section: s.sectionId,

      "Father Name": s.fatherName,
      Phone: s.phone || s.fatherPhone,
      Email: s.email,
      Status: s.status,
      "Admission Date": new Date(s.admissionDate).toLocaleDateString(),
    }));

    if (format === "excel") {
      exportToExcel(exportData, "students", "Students");
    } else if (format === "csv") {
      exportToCSV(exportData, "students");
    } else if (format === "pdf") {
      const doc = generateStudentListPDF(students);
      doc.save("students.pdf");
    }

    toast({
      title: "Export successful",
      description: `Students data exported as ${format.toUpperCase()}`,
    });
  };

  // const handleImport = async (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   try {
  //     const data = await importFromExcel(file);

  //     // Process and validate imported data
  //     const students = data.map((row) => ({
  //       rollNumber: row["Roll Number"] || row.rollNumber,
  //       registrationNumber:
  //         row["Registration Number"] || row.registrationNumber,
  //       name: row["Name"] || row.name,
  //       class: String(row["Class"] || getClassById(row.classId).name),
  //       section: row["Section"] || row.sectionId,
  //       fatherName: row["Father Name"] || row.fatherName,
  //       phone: row["Phone"] || row.phone,
  //       email: row["Email"] || row.email,
  //       dateOfBirth: row["Date of Birth"] || row.dateOfBirth || new Date(),
  //       gender: row["Gender"] || row.gender || "Male",
  //     }));

  //     // Bulk create students
  //     for (const student of students) {
  //       await fetch("/api/students", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(student),
  //       });
  //     }

  //     toast({
  //       title: "Import successful",
  //       description: `${students.length} students imported successfully.`,
  //     });

  //     mutate();
  //   } catch (error) {
  //     toast({
  //       title: "Import failed",
  //       description: "Please check your file format and try again.",
  //       variant: "destructive",
  //     });
  //   }

  //   e.target.value = "";
  // };

  // const handleImport = async (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   try {
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     const res = await fetch("/api/students/import", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const result = await res.json();

  //     if (!res.ok) {
  //       throw new Error(result.error || "Import failed");
  //     }

  //     toast({
  //       title: "Import completed",
  //       description: `${result.success} students imported successfully${
  //         result.failed?.length ? `, ${result.failed.length} failed` : ""
  //       }.`,
  //     });

  //     if (result.failed?.length) {
  //       console.warn("Import failures:", result.failed);
  //     }

  //     mutate(); // refresh student list
  //   } catch (error) {
  //     toast({
  //       title: "Import failed",
  //       description: error.message || "Please check your Excel file.",
  //       variant: "destructive",
  //     });
  //   }

  //   e.target.value = "";
  // };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file); // frontend only
      setPreviewData(data);
      setImportFile(file);
      setShowPreview(true);
    } catch (err) {
      toast({
        title: "Invalid file",
        description: "Unable to read Excel file",
        variant: "destructive",
      });
    }

    e.target.value = "";
  };

  const confirmImport = async () => {
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await fetch("/api/teachers/students/import", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setImportResult(result);
      setShowPreview(false);
      setPreviewData([]);
      setImportFile(null);

      toast({
        title: "Import finished",
        description: `${result.success} imported, ${result.failed.length} failed`,
      });

      mutate(); // refresh list
    } catch (err) {
      toast({
        title: "Import failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };



  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description={`Manage all ${
          students?.length || 0
        } students in your school`}
      >
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </label>

          <Button asChild>
            <Link href="/students/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadStudentTemplate(classes)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={classFilter}
          onValueChange={(value) => {
            setClassFilter(value);
            setSectionFilter(""); // reset section
          }}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Class" />
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

        <Select
          value={sectionFilter}
          onValueChange={setSectionFilter}
          disabled={!classFilter}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Section" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>

            {getClassById(classFilter)?.sections?.map((sec) => (
              <SelectItem key={sec._id} value={sec.name}>
                Section {sec.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {studentsLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description="Get started by adding your first student or adjust your filters."
          action={
            <Button asChild>
              <Link href="/students/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Father Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students &&
                students.length > 0 &&
                students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={student.photo?.url || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {student.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.registrationNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>
                      {/* {getClassById(student.classId)?.name ?? "—"} -{" "}  */}
                      {student.classId.name} {student.sectionId ?? "—"}
                    </TableCell>

                    <TableCell>{student.fatherName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{student.phone || student.fatherPhone}</p>
                        <p className="text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/students/${student._id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/students/${student._id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(student._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {importResult?.failed?.length > 0 && (
        <div className="border rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-2 text-red-600">Failed Records</h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importResult.failed.map((f, i) => (
                <TableRow key={i}>
                  <TableCell>{f.row}</TableCell>
                  <TableCell className="text-red-500">{f.error}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-t">
        <p className="text-sm text-muted-foreground">
          Page {data?.page} of {data?.totalPages}
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
            disabled={page === data?.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      <ImportPreviewDialog
        open={showPreview}
        data={previewData}
        onConfirm={confirmImport}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
