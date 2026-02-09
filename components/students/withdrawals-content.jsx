"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Icons
import {
  Plus,
  UserMinus,
  Download,
  Printer,
  GraduationCap,
  UserCheck,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function WithdrawalsContent() {
  // Global filters
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [limit, setLimit] = useState(10);
  const [activeTab, setActiveTab] = useState("Active");

  // Pagination per status
  const [pages, setPages] = useState({ Active: 1, Inactive: 1, Graduated: 1 });

  const updatePage = (status, p) =>
    setPages((prev) => ({ ...prev, [status]: p }));

  // Modal & form
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();

  // Unified Query Helper
  const getQueryParams = (status) => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (classFilter && classFilter !== "all") p.set("class", classFilter);
    if (sectionFilter && sectionFilter !== "all")
      p.set("section", sectionFilter);
    p.set("status", status);
    p.set("page", String(pages[status]));
    p.set("limit", String(limit));
    return p.toString();
  };

  // SWR fetches
  const {
    data: activeRes,
    isLoading: activeLoading,
    mutate: mutateActive,
  } = useSWR(`/api/students?${getQueryParams("Active")}`, fetcher);
  const {
    data: withdrawnRes,
    isLoading: withdrawnLoading,
    mutate: mutateWithdrawn,
  } = useSWR(`/api/students?${getQueryParams("Inactive")}`, fetcher);
  const {
    data: graduatedRes,
    isLoading: graduatedLoading,
    mutate: mutateGraduated,
  } = useSWR(`/api/students?${getQueryParams("Graduated")}`, fetcher);
  const { data: classesRes } = useSWR(`/api/academics/classes`, fetcher);

  const classes = classesRes?.data || [];

  // Table Data Mapping
  const tabConfig = {
    Active: {
      res: activeRes,
      loading: activeLoading,
      mutate: mutateActive,
      color: "bg-emerald-500",
    },
    Inactive: {
      res: withdrawnRes,
      loading: withdrawnLoading,
      mutate: mutateWithdrawn,
      color: "bg-amber-500",
    },
    Graduated: {
      res: graduatedRes,
      loading: graduatedLoading,
      mutate: mutateGraduated,
      color: "bg-indigo-500",
    },
  };

  // Actions
  async function handleStatusUpdate(id, newStatus, extraData = {}) {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extraData }),
      });
      if (!res.ok) throw new Error(`Failed to update to ${newStatus}`);
      toast.success(`Student status updated to ${newStatus}`);
      mutateActive();
      mutateWithdrawn();
      mutateGraduated();
      setIsWithdrawOpen(false);
      reset();
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Helper for Pagination Buttons
  const renderPagination = (status) => {
    const currentRes = tabConfig[status].res;
    if (!currentRes || currentRes.totalPages <= 1) return null;

    const currentPage = pages[status];
    const totalPages = currentRes.totalPages;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-900">
            {(currentPage - 1) * limit + 1}
          </span>{" "}
          to{" "}
          <span className="font-bold text-slate-900">
            {Math.min(currentPage * limit, currentRes.total)}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-900">{currentRes.total}</span>{" "}
          entries
        </p>
        <Pagination className="w-auto mx-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                onClick={() =>
                  currentPage > 1 && updatePage(status, currentPage - 1)
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i} className="hidden sm:inline-block">
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => updatePage(status, i + 1)}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                onClick={() =>
                  currentPage < totalPages &&
                  updatePage(status, currentPage + 1)
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Student Lifecycle"
        description="Manage active, withdrawn, and graduated student records."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="bg-white">
            <Download className="h-4 w-4 mr-2" /> PDF Report
          </Button>
          <Button variant="outline" size="sm" className="bg-white">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </PageHeader>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Active",
            val: activeRes?.total,
            icon: UserCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Withdrawn",
            val: withdrawnRes?.total,
            icon: UserMinus,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Graduates",
            val: graduatedRes?.total,
            icon: GraduationCap,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border-none shadow-sm ring-1 ring-slate-200"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label} Students
                </p>
                <h3 className="text-3xl font-bold mt-1 text-slate-900">
                  {stat.val || 0}
                </h3>
              </div>
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Filters */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="w-full md:flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, roll, or ID..."
                className="pl-10 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select onValueChange={setClassFilter} value={classFilter}>
                <SelectTrigger className="w-full md:w-[160px] bg-white">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(v) => {
                  setLimit(Number(v));
                  setPages({ Active: 1, Inactive: 1, Graduated: 1 });
                }}
              >
                <SelectTrigger className="w-[100px] bg-white">
                  <SelectValue placeholder={`${limit} / page`} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        defaultValue="Active"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-3 mb-4">
          <TabsTrigger value="Active">Active</TabsTrigger>
          <TabsTrigger value="Inactive">Withdrawn</TabsTrigger>
          <TabsTrigger value="Graduated">Graduated</TabsTrigger>
        </TabsList>

        {Object.entries(tabConfig).map(([status, config]) => (
          <TabsContent key={status} value={status}>
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>{status} Database</CardTitle>
                  <CardDescription>
                    Records of students currently marked as {status}
                  </CardDescription>
                </div>
                <Badge className={cn("capitalize", config.color)}>
                  {status}
                </Badge>
              </CardHeader>
              <CardContent>
                {config.loading ? (
                  <div className="h-60 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : config.res?.students.length === 0 ? (
                  <EmptyState
                    title={`No ${status} students found`}
                    description="Try adjusting your search or filters."
                  />
                ) : (
                  <>
                    <div className="rounded-md border border-slate-100 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="w-[300px]">Student</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>
                              {status === "Active" ? "Roll No" : "Status Date"}
                            </TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {config.res.students.map((s) => (
                            <TableRow
                              key={s._id}
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-slate-200">
                                    <AvatarImage src={s.photo?.url} />
                                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                      {s.name?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-semibold text-slate-900">
                                      {s.name}
                                    </div>
                                    <div className="text-xs text-slate-500 uppercase">
                                      {s.registrationNumber}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-slate-700">
                                {s.class}
                              </TableCell>
                              <TableCell className="text-slate-600 text-sm">
                                {status === "Active"
                                  ? s.rollNumber
                                  : new Date(
                                      s.withdrawalDate || s.updatedAt,
                                    ).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {status === "Active" ? (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-indigo-600"
                                        onClick={() =>
                                          handleStatusUpdate(s._id, "Graduated")
                                        }
                                      >
                                        <GraduationCap className="h-4 w-4 mr-1" />{" "}
                                        Graduate
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                          setValue("student", s._id);
                                          setIsWithdrawOpen(true);
                                        }}
                                      >
                                        Withdraw
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          window.open(
                                            `/api/students/${s._id}/tc`,
                                            "_blank",
                                          )
                                        }
                                      >
                                        <Printer className="h-4 w-4 mr-1" /> TC
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleStatusUpdate(s._id, "Active")
                                        }
                                      >
                                        Re-Activate
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {renderPagination(status)}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Withdrawal Dialog stays essentially the same but calls handleStatusUpdate */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <UserMinus className="h-5 w-5" /> Process Withdrawal
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((data) =>
              handleStatusUpdate(data.student, "Inactive", data),
            )}
            className="space-y-4 pt-4"
          >
            <input type="hidden" {...register("student")} />
            <div className="grid gap-2">
              <Label htmlFor="date">Withdrawal Date</Label>
              <Input
                type="date"
                id="date"
                {...register("withdrawalDate", { required: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Primary Reason</Label>
              <Select onValueChange={(v) => setValue("reason", v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">School Transfer</SelectItem>
                  <SelectItem value="relocation">Relocation</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Administrative Notes</Label>
              <Textarea
                {...register("notes")}
                placeholder="Enter any additional details..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsWithdrawOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Confirm Withdrawal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
