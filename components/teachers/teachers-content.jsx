"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  FileSpreadsheet,
  Users,
  Upload,
  Printer,
  Mail,
  Phone,
  ShieldCheck,
  MoreHorizontal,
} from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());
const statuses = ["Active", "Inactive", "On Leave", "Resigned"];

export function TeachersContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (statusFilter !== "all") queryParams.set("status", statusFilter);

  const { data, isLoading, mutate } = useSWR(
    `/api/teachers?${queryParams.toString()}`,
    fetcher
  );

  const teachers = data?.teachers || [];

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      <PageHeader
        title="Faculty Directory"
        description={`Managing ${data?.total || 0} professional staff members`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Action buttons - Mobile friendly grouping */}
          <div className="flex w-full sm:w-auto gap-2">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none border-zinc-200 dark:border-zinc-800"
            >
              <Upload className="h-4 w-4 mr-2" /> Import
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none border-zinc-200 dark:border-zinc-800"
                >
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="mr-2 h-4 w-4" /> PDF Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            asChild
            className="w-full sm:w-auto bg-primary shadow-lg shadow-primary/20"
          >
            <Link href="/teachers/add">
              <Plus className="h-4 w-4 mr-2" /> Add Teacher
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Modern Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by name, ID or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-transparent border-none focus-visible:ring-0 text-sm"
          />
        </div>
        <div className="h-px md:h-8 w-full md:w-px bg-zinc-200 dark:bg-zinc-800" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40 border-none bg-transparent focus:ring-0 font-medium">
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <LoadingSpinner size="lg" className="text-primary" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Loading Faculty...
          </p>
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState icon={Users} title="No teachers found" />
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden lg:block rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest">
                    Teacher Info
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest">
                    Personal ID
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest">
                    Designation
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest">
                    Contact Details
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-center">
                    Status
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TeacherRow
                    key={teacher._id}
                    teacher={teacher}
                    router={router}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE CARD VIEW (Visible on sm/md) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher._id}
                teacher={teacher}
                router={router}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Sub-component: Desktop Row
function TeacherRow({ teacher, router }) {
  return (
    <TableRow className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors group">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
            <AvatarImage src={teacher.photo?.url} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {teacher.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">
              {teacher.name}
            </p>
            <p className="text-xs text-zinc-500 font-medium">
              {teacher.qualification}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs text-zinc-500">
        {teacher.personalNo}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="bg-zinc-100 dark:bg-zinc-800 border-none font-bold text-[10px] uppercase"
        >
          {teacher.designation}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <Phone size={12} className="text-primary" /> {teacher.phone}
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            <Mail size={12} /> {teacher.email}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <StatusBadge status={teacher.status} />
      </TableCell>
      <TableCell>
        <ActionDropdown id={teacher._id} router={router} />
      </TableCell>
    </TableRow>
  );
}

// Sub-component: Mobile Card
function TeacherCard({ teacher, router }) {
  return (
    <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12 rounded-xl border-2 border-white dark:border-zinc-800">
            <AvatarImage src={teacher.photo?.url} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {teacher.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              {teacher.name}
            </h3>
            <p className="text-xs text-zinc-500">{teacher.designation}</p>
          </div>
        </div>
        <ActionDropdown id={teacher._id} router={router} />
      </div>

      <div className="grid grid-cols-2 gap-4 py-3 border-y border-zinc-100 dark:border-zinc-800">
        <div>
          <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
            Personal ID
          </p>
          <p className="text-xs font-mono font-bold">{teacher.personalNo}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
            Status
          </p>
          <StatusBadge status={teacher.status} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary">
            <Phone size={14} />
          </div>
          {teacher.phone}
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Mail size={14} />
          </div>
          {teacher.email}
        </div>
      </div>

      <Button
        variant="secondary"
        className="w-full text-xs font-bold rounded-xl h-10"
        onClick={() => router.push(`/teachers/${teacher._id}`)}
      >
        View Full Profile
      </Button>
    </div>
  );
}

// Helpers
function StatusBadge({ status }) {
  const styles = {
    Active:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Inactive: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
    "On Leave": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Resigned: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-bold text-[10px] uppercase px-2 py-0.5",
        styles[status]
      )}
    >
      {status}
    </Badge>
  );
}

function ActionDropdown({ id, router }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        <DropdownMenuItem onClick={() => router.push(`/teachers/${id}`)}>
          <Eye className="mr-2 h-4 w-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/teachers/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/teachers/${id}/print`)}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-500 focus:text-red-500">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}
