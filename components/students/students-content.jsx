

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
  DropdownMenuSeparator,
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
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  FileDown,
} from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import { useDebounce } from "@/hooks/useDebounce";
import { generateStudentListPDF } from "@/lib/pdf-generator";
import { downloadStudentTemplate } from "@/lib/excel-templates";
import { ImportPreviewDialog } from "./import-preview-dialog";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";

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
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const debouncedSearch = useDebounce(search, 400);
  const searchParams = useSearchParams();

  // Initialize filters from URL or LocalStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem("studentFilters");
    const initialFilters = savedFilters ? JSON.parse(savedFilters) : {};

    setSearch(searchParams.get("search") || initialFilters.search || "");
    setClassFilter(
      searchParams.get("classId") || initialFilters.classFilter || "all"
    );
    setSectionFilter(
      searchParams.get("sectionId") || initialFilters.sectionFilter || "all"
    );
    setStatusFilter(
      searchParams.get("status") || initialFilters.statusFilter || "Active"
    );
  }, []);

  // Update URL and LocalStorage on filter change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (classFilter !== "all") params.set("classId", classFilter);
    if (sectionFilter !== "all") params.set("sectionId", sectionFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("page", page.toString());

    router.replace(`?${params.toString()}`, { scroll: false });

    localStorage.setItem(
      "studentFilters",
      JSON.stringify({
        search,
        classFilter,
        sectionFilter,
        statusFilter,
      })
    );
  }, [search, classFilter, sectionFilter, statusFilter, page]);

  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.set("search", debouncedSearch);
  if (classFilter !== "all") queryParams.set("classId", classFilter);
  if (sectionFilter !== "all") queryParams.set("sectionId", sectionFilter);
  if (statusFilter !== "all") queryParams.set("status", statusFilter);
  queryParams.set("page", page.toString());
  queryParams.set("limit", limit.toString());

  const {
    data,
    isLoading: studentsLoading,
    mutate,
  } = useSWR(`/api/students?${queryParams.toString()}`, fetcher);
  const { classes, classesLoading } = useClasses();

  const students = data?.students || [];
  console.log(students)

  const getClassById = (classId) => classes?.find((c) => c._id === classId);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast({
          title: "Student deleted",
          description: "Records updated successfully.",
        });
        mutate();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student.",
        variant: "destructive",
      });
    }
  };

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

    if (format === "excel") exportToExcel(exportData, "students", "Students");
    else if (format === "csv") exportToCSV(exportData, "students");
    else if (format === "pdf")
      generateStudentListPDF(students).save("students.pdf");

    toast({
      title: "Export successful",
      description: `File ready in ${format.toUpperCase()}`,
    });
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importFromExcel(file);
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
      setImportFile(null);
      toast({
        title: "Import finished",
        description: `${result.success} imported, ${result.failed.length} failed`,
      });
      mutate();
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
    setPage(1);
    localStorage.removeItem("studentFilters");
    router.replace("/students", { scroll: false });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Students",
            value: data?.total || 0,
            icon: Users,
            color: "from-indigo-500 to-blue-600",
          },
          {
            label: "Active",
            value: students.filter((s) => s.status === "Active").length,
            icon: UserCheck,
            color: "from-emerald-500 to-teal-600",
          },
          {
            label: "Inactive/Other",
            value: students.filter((s) => s.status !== "Active").length,
            icon: UserX,
            color: "from-orange-500 to-rose-600",
          },
          {
            label: "Classes",
            value: classes?.length || 0,
            icon: GraduationCap,
            color: "from-amber-500 to-orange-600",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={cn(
              "relative overflow-hidden rounded-2xl p-5 text-white shadow-lg shadow-indigo-100/20 bg-gradient-to-br",
              card.color
            )}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{card.label}</p>
                <p className="text-3xl font-bold tracking-tight">
                  {card.value}
                </p>
              </div>
              <card.icon className="h-10 w-10 opacity-30" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-white/10 blur-2xl" />
          </div>
        ))}
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-0">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <PageHeader
                title="Students"
                description={`Managing ${data?.total || 0} enrolled students`}
                className="p-0 space-y-0"
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(showFilters && "bg-slate-100")}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => handleExport("excel")}>
                      <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />{" "}
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-600" />{" "}
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")}>
                      <FileDown className="h-4 w-4 mr-2 text-rose-600" /> PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadStudentTemplate(classes)}
                >
                  <Upload className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Template</span>
                </Button>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleImport}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <FileSpreadsheet className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Import</span>
                    </span>
                  </Button>
                </label>

                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
                  asChild
                >
                  <Link href="/students/add">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span>Add Student</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Collapsible Filter Bar */}
            <div
              className={cn(
                "grid grid-cols-1 gap-3 md:grid-cols-12 transition-all duration-300",
                showFilters
                  ? "opacity-100 h-auto"
                  : "opacity-0 h-0 overflow-hidden pointer-events-none"
              )}
            >
              <div className="relative md:col-span-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, roll, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="bg-slate-50/50">
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

              <div className="md:col-span-2">
                <Select
                  value={sectionFilter}
                  onValueChange={setSectionFilter}
                  disabled={classFilter === "all"}
                >
                  <SelectTrigger className="bg-slate-50/50">
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

              <div className="md:col-span-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-50/50">
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

              <div className="md:col-span-2 flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-500 hover:text-rose-600"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" /> Clear Filters
                </Button>
              </div>
            </div>

            {/* Active Filter Badges */}
            {(search ||
              classFilter !== "all" ||
              sectionFilter !== "all" ||
              statusFilter !== "all") && (
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                {search && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Search: {search}
                  </Badge>
                )}
                {classFilter !== "all" && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Class: {getClassById(classFilter)?.name}
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="px-3 py-1">
                    Status: {statusFilter}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Table / Content Area */}
          <div className="border-t border-slate-100">
            {studentsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <LoadingSpinner size="lg" className="text-indigo-600" />
                <p className="text-sm text-slate-500 font-medium">
                  Fetching records...
                </p>
              </div>
            ) : students.length === 0 ? (
              <div className="py-20">
                <EmptyState
                  icon={GraduationCap}
                  title="No students found"
                  description="Adjust your filters or add a new student to the system."
                  action={
                    <Button onClick={clearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                {/* Mobile View */}
                <div className="grid gap-4 p-4 sm:hidden">
                  {students.map((student) => (
                    <div
                      key={student._id}
                      className="rounded-xl border border-slate-200 p-4 space-y-4 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-slate-100">
                          <AvatarImage src={student.photo?.url} />
                          <AvatarFallback className="bg-indigo-50 text-indigo-700">
                            {student.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            Roll #{student.rollNumber}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            student.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          )}
                        >
                          {student.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm border-t border-slate-50 pt-3">
                        <div>
                          <p className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                            Academic
                          </p>
                          <p className="font-medium">
                            {student.classId?.name} - {student.sectionId}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                            Contact
                          </p>
                          <p className="font-medium truncate">
                            {student.phone || student.fatherPhone}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          className="flex-1"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/students/${student._id}`}>View</Link>
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/students/${student._id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/students/${student._id}/print`)
                          }
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="pl-6 py-4 font-bold text-slate-700">
                          Student Profile
                        </TableHead>
                        <TableHead className="font-bold text-slate-700">
                          Roll No.
                        </TableHead>
                        <TableHead className="font-bold text-slate-700">
                          Class & Section
                        </TableHead>
                        <TableHead className="font-bold text-slate-700">
                          Guardian
                        </TableHead>
                        <TableHead className="font-bold text-slate-700">
                          Contact
                        </TableHead>
                        <TableHead className="font-bold text-slate-700">
                          Status
                        </TableHead>
                        <TableHead className="w-16 pr-6"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        
                        <TableRow
                          key={student._id}
                          className="group transition-colors hover:bg-indigo-50/30"
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm transition-transform group-hover:scale-110">
                                <AvatarImage
                                  src={student.photo?.url || "/placeholder.svg"}
                                />
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                                  {student.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                  {student.name}
                                </p>
                                <p className="text-xs text-slate-500 font-mono">
                                  {student.registrationNumber}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-600">
                            {student.rollNumber}
                          </TableCell>
                          <TableCell>
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                              {student.classId?.name} •{" "}
                              {student.sectionId || "—"}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium">
                            {student.fatherName}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-0.5">
                              <p className="font-medium text-slate-700">
                                {student.phone || student.fatherPhone}
                              </p>
                              <p className="text-xs text-slate-400 truncate max-w-[150px]">
                                {student.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "rounded-full font-bold text-[10px] uppercase tracking-tighter px-2.5",
                                student.status === "Active"
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-red-600 border-slate-200"
                              )}
                            >
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-full hover:bg-white hover:shadow-sm"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/students/${student._id}`)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" /> View Full
                                  Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/students/${student._id}/report`)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Attendance Record
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/students/${student._id}/edit`)
                                  }
                                >
                                  <Edit className="h-4 w-4 mr-2" /> Edit Records
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/students/${student._id}/admission-form`
                                    )
                                  }
                                >
                                  <Printer className="h-4 w-4 mr-2" /> Admission
                                  Form
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/students/${student._id}/print`
                                    )
                                  }
                                >
                                  <Printer className="h-4 w-4 mr-2" /> Student
                                  ID Card
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(student._id)}
                                  className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  Student
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 border-t border-slate-100 gap-4">
            <p className="text-sm font-medium text-slate-500">
              Page <span className="text-slate-900">{data?.page || 1}</span> of{" "}
              <span className="text-slate-900">{data?.totalPages || 1}</span>
              <span className="ml-2 text-slate-300">|</span>
              <span className="ml-2 font-normal">
                Total {data?.total || 0} entries
              </span>
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center -space-x-px">
                {Array.from({ length: Math.min(data?.totalPages || 0, 5) }).map(
                  (_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 rounded-none first:rounded-l-md last:rounded-r-md",
                        page === i + 1
                          ? "bg-indigo-600 border-indigo-600"
                          : "bg-white"
                      )}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm disabled:opacity-50"
                disabled={page === data?.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Error Handling UI */}
      {importResult?.failed?.length > 0 && (
        <Card className="border-rose-200 bg-rose-50/30 overflow-hidden">
          <div className="p-4 border-b border-rose-100 bg-rose-100/50 flex justify-between items-center">
            <h3 className="font-bold text-rose-800 flex items-center">
              <X className="h-4 w-4 mr-2" /> {importResult.failed.length} Rows
              Failed to Import
            </h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/50">
                  <TableHead className="w-20">Row</TableHead>
                  <TableHead>Error Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importResult.failed.map((f, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{f.row}</TableCell>
                    <TableCell className="text-rose-600 text-sm">
                      {f.error}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <ImportPreviewDialog
        open={showPreview}
        data={previewData}
        onConfirm={confirmImport}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}