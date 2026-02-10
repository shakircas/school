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
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  FileDown,
  CalendarDays,
} from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import { useDebounce } from "@/hooks/useDebounce";
import { generateStudentListPDF } from "@/lib/pdf-generator";
import { downloadStudentTemplate } from "@/lib/excel-templates";
import { ImportPreviewDialog } from "./import-preview-dialog";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { useSubjects } from "../hooks/useSubjects";
import { useTeachers } from "../hooks/useTeachers";
import SummaryStats from "./SummaryStats";
import StudentTable from "./StudentTable";
import { Pagination } from "../ui/pagination";
import StudentTablePagination from "./StudentTablePagination";

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
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedSearch = useDebounce(search, 400);
  const searchParams = useSearchParams();

  // Initialize filters from URL or LocalStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem("studentFilters");
    const initialFilters = savedFilters ? JSON.parse(savedFilters) : {};

    setSearch(searchParams.get("search") || initialFilters.search || "");
    setClassFilter(
      searchParams.get("classId") || initialFilters.classFilter || "all",
    );
    setSectionFilter(
      searchParams.get("sectionId") || initialFilters.sectionFilter || "all",
    );
    setStatusFilter(
      searchParams.get("status") || initialFilters.statusFilter || "all",
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
      }),
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
  const { subjects, subjectsLoading } = useSubjects();
  const { teachers, teachersLoading } = useTeachers();

  const students = data?.students || [];
  console.log(students);

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
      <SummaryStats
        data={data}
        teachers={teachers}
        subjects={subjects}
        classes={classes}
      />

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
                    <span>Add</span>
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
                  : "opacity-0 h-0 overflow-hidden pointer-events-none",
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

          {/* 3. The Separated Table Component */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <StudentTable
              students={students}
              isLoading={studentsLoading}
              onDelete={handleDelete}
              onClearFilters={clearFilters}
            />
          </div>
          <StudentTablePagination
            data={data}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
          />
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
