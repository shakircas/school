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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Edit, Trash2, Wallet, School, Layers } from "lucide-react";
import { FeeStructureTable } from "./fee-structure-table";

const fetcher = (url) => fetch(url).then((r) => r.json());

const emptyForm = {
  classId: "",
  sectionId: "all",
  academicYear: "2024-2025",

  effectiveFromMonth: "",
  effectiveToMonth: null,

  isMonthly: true,
  applicableMonths: [],

  fees: {
    tuitionFee: 0,
    admissionFee: 0,
    examFee: 0,
    labFee: 0,
    libraryFee: 0,
    sportsFee: 0,
    transportFee: 0,
    computerFee: 0,
    otherFee: 0,
  },

  remarks: "",
};


export function FeeStructureContent() {
  const [editingId, setEditingId] = useState(null);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: classRes } = useSWR("/api/academics/classes", fetcher);
  const classes = classRes?.data || [];

  const { data, mutate } = useSWR("/api/admin/fee-structures", fetcher);
  const feeStructures = data?.data || [];

  const updateFee = (k, v) =>
    setForm((p) => ({
      ...p,
      fees: { ...p.fees, [k]: Number(v || 0) },
    }));

  const total = Object.values(form.fees).reduce((s, v) => s + v, 0);

  const edit = (f) => {
    setForm(f);
    setOpen(true);
  };

  const remove = async (id) => {
    if (!confirm("Delete this fee structure?")) return;

    await fetch(`/api/admin/fee-structures/${id}`, { method: "DELETE" });
    toast({ title: "Fee structure deleted" });
    mutate();
  };

  const onEdit = (fee) => {
    setForm({
      ...fee,
      _id: null, // 🔥 IMPORTANT
      effectiveFromMonth: "",
    });
    setEditingId(null);
    setOpen(true);
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this fee structure?")) return;

    await fetch(`/api/admin/fee-structures/${id}`, {
      method: "DELETE",
    });

    toast({ title: "Fee structure deleted" });
    mutate();
  };

  const save = async () => {
    if (!form.classId || !form.effectiveFromMonth) {
      toast({
        title: "Class & effective month required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      academicYear: form.academicYear,
      classId: form.classId,
      sectionId: form.sectionId || "all",
      effectiveFromMonth: form.effectiveFromMonth,
      fees: form.fees,
      isMonthly: form.isMonthly,
      applicableMonths: form.isMonthly ? [] : form.applicableMonths,
      remarks: form.remarks,
    };

    await fetch("/api/admin/fee-structures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    toast({ title: "New fee version created" });
    setOpen(false);
    setForm(emptyForm);
    mutate();
  };

  const normalizedFeeStructures = feeStructures.map((f) => ({
    ...f,
    className: f.className || f.classId?.name || "—",
    sectionName: f.sectionName || "All Sections",
    total: Object.values(f.fees || {}).reduce((s, v) => s + v, 0),
  }));


  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structure"
        description="Define class & section wise fee configuration"
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Fee Structure
              </DialogTitle>
            </DialogHeader>

            {/* Class / Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Class</Label>
                <Select
                  value={form.classId}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, classId: v, sectionId: "all" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Section (optional)</Label>
                <Select
                  value={form.sectionId}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, sectionId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {classes
                      .find((c) => c._id === form.classId)
                      ?.sections?.map((s) => (
                        <SelectItem key={s._id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Effective From Month</Label>
              <Input
                type="month"
                value={form.effectiveFromMonth}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    effectiveFromMonth: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fee Type</Label>
                <Select
                  value={form.isMonthly ? "monthly" : "custom"}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      isMonthly: v === "monthly",
                      applicableMonths: [],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fees */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {Object.keys(form.fees).map((k) => (
                <div key={k}>
                  <Label className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {k.replace(/Fee$/, " Fee")}
                  </Label>
                  <Input
                    type="number"
                    value={form.fees[k]}
                    onChange={(e) => updateFee(k, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between">
              <span className="font-medium">Total Fee</span>
              <span className="text-xl font-bold text-primary">
                Rs. {total.toLocaleString()}
              </span>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* TABLE */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Fee Structures</CardTitle>
          <CardDescription>
            Class & section wise annual fee configuration
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Total Fee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {feeStructures.map((f) => {
                const total = Object.values(f.fees).reduce((s, v) => s + v, 0);
                return (
                  <TableRow key={f._id}>
                    <TableCell>
                      <Badge variant="outline">
                        <School className="h-3 w-3 mr-1" />
                        {f.className}
                      </Badge>
                    </TableCell>
                    <TableCell>{f.sectionName || "All"}</TableCell>
                    <TableCell className="font-semibold">
                      Rs. {total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => edit(f)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => remove(f._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structures</CardTitle>
          <CardDescription>
            Class & section wise annual fee configuration
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FeeStructureTable
            onEdit={onEdit}
            onDelete={onDelete}
            feeStructures={normalizedFeeStructures}
          />
        </CardContent>
      </Card>
    </div>
  );
}
