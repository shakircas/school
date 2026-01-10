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
  Users,
  UserCheck,
  UserX,
  Printer,
  FormInputIcon,
  User,
} from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import { useStudents } from "../hooks/useStudents";
import { useDebounce } from "@/hooks/useDebounce";
import { generateStudentListPDF } from "@/lib/pdf-generator";
import { downloadStudentTemplate } from "@/lib/excel-templates";
import { ImportPreviewDialog } from "./import-preview-dialog";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";

const fetcher = (url) => fetch(url).then((res) => res.json());

const statuses = ["Active", "Inactive", "Graduated", "Transferred"];

export function StudentsContent() {
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [page, setPage] = useState(1);
  const limit = 10;

  const debouncedSearch = useDebounce(search, 400);

  const searchParams = useSearchParams();

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setClassFilter(searchParams.get("classId") || "all");
    setSectionFilter(searchParams.get("sectionId") || "all");
    setStatusFilter(searchParams.get("status") || "Active");
  }, []);

  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.set("search", debouncedSearch);
  if (classFilter) queryParams.set("classId", classFilter);
  if (sectionFilter) queryParams.set("sectionId", sectionFilter);

  if (statusFilter) queryParams.set("status", statusFilter);

  queryParams.set("page", page);
  queryParams.set("limit", limit);

  // useEffect(() => {
  //   setPage(1);
  // }, [search, classFilter, sectionFilter, statusFilter]);

  if (debouncedSearch) {
    queryParams.set("search", debouncedSearch);
  }

  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (classFilter !== "all") params.set("classId", classFilter);
    if (sectionFilter !== "all") params.set("sectionId", sectionFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);

    params.set("page", "1");

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [search, classFilter, sectionFilter, statusFilter]);

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

  useEffect(() => {
    const filters = {
      search,
      classFilter,
      sectionFilter,
      statusFilter,
    };

    localStorage.setItem("studentFilters", JSON.stringify(filters));
  }, [search, classFilter, sectionFilter, statusFilter]);

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

  const clearFilters = () => {
    setSearch("");
    setClassFilter("all");
    setSectionFilter("all");
    setStatusFilter("Active");
    localStorage.removeItem("studentFilters");
    router.replace("/students", { scroll: false });
  };

  return (
    <Card className="px-4" >
      <div className="space-y-6">
        {/* ===== Summary Cards ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-5 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Students</p>
                <p className="text-2xl font-bold">{data?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 opacity-90" />
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-5 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Active</p>
                <p className="text-2xl font-bold">
                  {students.filter((s) => s.status === "Active").length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 opacity-90" />
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white p-5 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Inactive</p>
                <p className="text-2xl font-bold">
                  {students.filter((s) => s.status !== "Active").length}
                </p>
              </div>
              <UserX className="h-8 w-8 opacity-90" />
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Classes</p>
                <p className="text-2xl font-bold">{classes?.length || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 opacity-90" />
            </div>
          </div>
        </div>

        <PageHeader
          title="Students"
          description={`Manage all ${
            students?.length || 0
          } students in your school`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* ===== Export ===== */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* ===== Download Template ===== */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadStudentTemplate(classes)}
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Template</span>
            </Button>

            {/* ===== Import ===== */}
            <label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleImport}
              />
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Import</span>
                </span>
              </Button>
            </label>

            {/* ===== Add Student (Primary) ===== */}
            <Button size="sm" asChild>
              <Link href="/students/add">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Student</span>
              </Link>
            </Button>
            <Button asChild>
              <Link href="/students/print">
                <Printer className="h-4 w-4 mr-2" />
                Bulk Print
              </Link>
            </Button>
          </div>
        </PageHeader>

        <div className="flex items-center justify-between md:hidden mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((p) => !p)}
          >
            Filters
          </Button>

          {(search || classFilter !== "all" || sectionFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Filters */}
        <div
          className={cn(
            "transition-all duration-300 overflow-hidden",
            showFilters || window.innerWidth >= 768
              ? "max-h-[300px] opacity-100"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
            <div className="p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                {/* 🔍 Search */}
                <div className="relative md:col-span-5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* 🎓 Class */}
                <div className="md:col-span-2">
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes?.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 📚 Section */}
                <div className="md:col-span-2">
                  <Select
                    value={sectionFilter}
                    onValueChange={setSectionFilter}
                    disabled={classFilter === "all"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {getClassById(classFilter)?.sections?.map((s) => (
                        <SelectItem key={s._id} value={s.name}>
                          Section {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 🟢 Status */}
                <div className="md:col-span-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 🧹 Clear */}
                <div className="md:col-span-1 flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={clearFilters}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(search || classFilter !== "all" || sectionFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mt-3">
            {search && (
              <Badge variant="secondary" onClick={() => setSearch("")}>
                Search: {search} ✕
              </Badge>
            )}

            {classFilter !== "all" && (
              <Badge variant="secondary" onClick={() => setClassFilter("all")}>
                Class ✕
              </Badge>
            )}

            {sectionFilter !== "all" && (
              <Badge
                variant="secondary"
                onClick={() => setSectionFilter("all")}
              >
                Section ✕
              </Badge>
            )}

            {statusFilter !== "all" && (
              <Badge variant="secondary" onClick={() => setStatusFilter("all")}>
                Status: {statusFilter} ✕
              </Badge>
            )}
          </div>
        )}

        {/* ===== Mobile Cards ===== */}
        <div className="grid gap-4 sm:hidden">
          {students.map((student) => (
            <div
              key={student._id}
              className="rounded-xl border p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={student.photo?.url} />
                  <AvatarFallback>{student.name?.[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Roll #{student.rollNumber}
                  </p>
                </div>

                <Badge>{student.status}</Badge>
              </div>

              <div className="text-sm grid grid-cols-2 gap-2">
                <p>
                  <span className="text-muted-foreground">Class:</span>{" "}
                  {student.classId?.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Section:</span>{" "}
                  {student.sectionId}
                </p>
                <p>
                  <span className="text-muted-foreground">Father:</span>{" "}
                  {student.fatherName}
                </p>
                <p>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  {student.phone}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => router.push(`/students/${student._id}/print`)}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/students/${student._id}`)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/students/${student._id}/edit`)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
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
          <div className="rounded-lg border border-border overflow-hidden hidden sm:block">
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
                    <TableRow
                      key={student._id}
                      className="hover:bg-muted/50 transition"
                    >
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
                          <p className="text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.status === "Active"
                              ? "default"
                              : "secondary"
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
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                router.push(
                                  `/students/${student._id}/admission-form`
                                )
                              }
                            >
                              <Printer className="h-4 w-4" />
                              Admission Form
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                router.push(`/students/${student._id}/print`)
                              }
                            >
                              <Printer className="h-4 w-4" />
                              Print
                            </DropdownMenuItem>
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
    </Card>
  );
}
