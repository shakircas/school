// components/students/WithdrawalsContent.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { saveAs } from "file-saver";
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
import { Plus, UserMinus, Download, Printer } from "lucide-react";
import { toast } from "sonner";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function WithdrawalsContent() {
  // Global filters
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [limit, setLimit] = useState(10);

  // Independent pagination per table
  const [activePage, setActivePage] = useState(1);
  const [withdrawnPage, setWithdrawnPage] = useState(1);

  // Modal & form
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();

  // Compose query params for Active students
  const activeParams = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (classFilter) p.set("class", classFilter);
    if (sectionFilter) p.set("section", sectionFilter);
    p.set("status", "Active");
    p.set("page", String(activePage));
    p.set("limit", String(limit));
    return p.toString();
  }, [search, classFilter, sectionFilter, activePage, limit]);

  // Compose query params for Withdrawn students
  const withdrawnParams = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (classFilter) p.set("class", classFilter);
    if (sectionFilter) p.set("section", sectionFilter);
    p.set("status", "Inactive"); // backend stores as Inactive
    p.set("page", String(withdrawnPage));
    p.set("limit", String(limit));
    return p.toString();
  }, [search, classFilter, sectionFilter, withdrawnPage, limit]);

  // SWR fetch
  const {
    data: activeRes,
    isLoading: activeLoading,
    mutate: mutateActive,
  } = useSWR(`/api/students?${activeParams}`, fetcher);
  const {
    data: withdrawnRes,
    isLoading: withdrawnLoading,
    mutate: mutateWithdrawn,
  } = useSWR(`/api/students?${withdrawnParams}`, fetcher);

  const { data: classesRes } = useSWR(`/api/academics/classes`, fetcher);

  const classes = classesRes?.data || [];

  const activeStudents = activeRes?.students || [];
  const activeTotal = activeRes?.total || 0;
  const withdrawnStudents = withdrawnRes?.students || [];
  const withdrawnTotal = withdrawnRes?.total || 0;

  // Open withdrawal modal
  function openWithdraw(studentId) {
    setValue("student", studentId);
    setIsWithdrawOpen(true);
  }

  // Withdraw student
  async function onSubmitWithdraw(formData) {
    try {
      const body = {
        status: "Inactive",
        withdrawalDate: formData.withdrawalDate,
        withdrawalReason: formData.reason,
        notes: formData.notes || "",
      };
      const res = await fetch(`/api/students/${formData.student}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to withdraw student");
      toast.success("Student withdrawn");
      setIsWithdrawOpen(false);
      reset();
      mutateActive();
      mutateWithdrawn();
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Activate student
  async function activateStudent(id) {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Active",
          withdrawalDate: null,
          withdrawalReason: null,
        }),
      });
      if (!res.ok) throw new Error("Failed to activate student");
      toast.success("Student activated");
      mutateActive();
      mutateWithdrawn();
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Print TC
  function printTC(studentId) {
    window.open(`/api/students/${studentId}/tc`, "_blank");
  }

  // Export PDF
  async function exportPDF(status) {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (classFilter) params.set("class", classFilter);
      if (sectionFilter) params.set("section", sectionFilter);
      params.set("status", status);
      const res = await fetch(`/api/students/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      saveAs(
        blob,
        `${status.toLowerCase()}_students_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );
      toast.success("Download started");
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Export CSV
  function exportCSV(students, filename) {
    if (!students.length) return toast.error("No students to export");
    const headers = [
      "Name",
      "Roll",
      "Registration",
      "Class",
      "Section",
      "Status",
      "Withdrawal Date",
      "Reason",
      "Notes",
    ];
    const rows = students.map((s) => [
      s.name,
      s.rollNumber,
      s.registrationNumber,
      s.class,
      s.section,
      s.status === "Inactive" ? "Withdrawn" : s.status,
      s.withdrawalDate ? new Date(s.withdrawalDate).toLocaleDateString() : "",
      s.withdrawalReason || "",
      s.notes || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((r) =>
          r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = filename;
    link.click();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Withdrawals"
        description="Manage student withdrawals, exports and transfer certificates"
      >
        <div className="flex items-center gap-2">
          <Button onClick={() => exportPDF("Active")} variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export Active (PDF)
          </Button>
          <Button onClick={() => exportPDF("Inactive")} variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export Withdrawn (PDF)
          </Button>
          <Button
            onClick={() => exportCSV(activeStudents, "active_students.csv")}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" /> Export Active (CSV)
          </Button>
          <Button
            onClick={() =>
              exportCSV(withdrawnStudents, "withdrawn_students.csv")
            }
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" /> Export Withdrawn (CSV)
          </Button>
        </div>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 relative max-w-sm">
            <Input
              placeholder="Search (name, roll, registration)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActivePage(1);
                setWithdrawnPage(1);
              }}
            />
          </div>
          <Select
            onValueChange={(v) => {
              setClassFilter(v);
              setActivePage(1);
              setWithdrawnPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Class" />
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
              setSectionFilter(v);
              setActivePage(1);
              setWithdrawnPage(1);
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {classes
                .find((c) => c._id === classFilter)
                ?.sections?.map((s) => (
                  <SelectItem key={s._id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue>{limit} / page</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeTotal}</div>
            <p className="text-sm text-muted-foreground">Active Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{withdrawnTotal}</div>
            <p className="text-sm text-muted-foreground">Withdrawn Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {activeTotal + withdrawnTotal}
            </div>
            <p className="text-sm text-muted-foreground">Total (filtered)</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Students</CardTitle>
          <CardDescription>Choose a student to withdraw</CardDescription>
        </CardHeader>
        <CardContent>
          {activeLoading ? (
            <div className="py-6 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : activeStudents.length === 0 ? (
            <EmptyState
              title="No active students"
              description="No results for your filters"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeStudents.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={s.photo?.url || "/placeholder.svg"}
                          />
                          <AvatarFallback>{s.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {s.registrationNumber}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{s.class}</TableCell>
                    <TableCell>{s.rollNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openWithdraw(s._id)}
                      >
                        Withdraw
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {/* Active Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {activeRes?.page || 1} of {activeRes?.totalPages || 1}
            </div>
            <div className="flex items-center gap-2">
              <Button
                disabled={(activeRes?.page || 1) <= 1}
                onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                disabled={
                  (activeRes?.page || 1) >= (activeRes?.totalPages || 1)
                }
                onClick={() => setActivePage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawn Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawn Students</CardTitle>
          <CardDescription>Recently withdrawn students</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawnLoading ? (
            <div className="py-6 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : withdrawnStudents.length === 0 ? (
            <EmptyState
              icon={UserMinus}
              title="No withdrawal records"
              description="No students have been withdrawn yet"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Withdrawal Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawnStudents.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={s.photo?.url || "/placeholder.svg"}
                            />
                            <AvatarFallback>{s.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{s.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {s.rollNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{s.class}</TableCell>
                      <TableCell>
                        {s.withdrawalDate
                          ? new Date(s.withdrawalDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="capitalize">
                        {s.withdrawalReason || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => printTC(s._id)}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            TC
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => activateStudent(s._id)}
                          >
                            Activate
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Withdrawn Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {withdrawnRes?.page || 1} of{" "}
                  {withdrawnRes?.totalPages || 1}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={(withdrawnRes?.page || 1) <= 1}
                    onClick={() => setWithdrawnPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    disabled={
                      (withdrawnRes?.page || 1) >=
                      (withdrawnRes?.totalPages || 1)
                    }
                    onClick={() => setWithdrawnPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Modal */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Withdrawal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitWithdraw)} className="space-y-4">
            <input type="hidden" {...register("student")} />
            <div>
              <Label>Withdrawal Date</Label>
              <Input
                type="date"
                {...register("withdrawalDate", { required: true })}
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Select onValueChange={(v) => setValue("reason", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">
                    Transfer to another school
                  </SelectItem>
                  <SelectItem value="relocation">Family relocation</SelectItem>
                  <SelectItem value="financial">Financial reasons</SelectItem>
                  <SelectItem value="health">Health issues</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea {...register("notes")} rows={3} />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsWithdrawOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Process Withdrawal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
