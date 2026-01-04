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
  _id: null,
  classId: "",
  sectionId: null,
  academicYear: "2024-2025",
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
  isMonthly: true,
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

  // const save = async () => {
  //   if (!form.classId) {
  //     toast({ title: "Select class", variant: "destructive" });
  //     return;
  //   }

  //   const res = await fetch("/api/admin/fee-structures", {
  //     method: form._id ? "PUT" : "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(form),
  //   });

  //   if (!res.ok) {
  //     toast({ title: "Save failed", variant: "destructive" });
  //     return;
  //   }

  //   toast({ title: "Fee structure saved" });
  //   setOpen(false);
  //   setForm(emptyForm);
  //   mutate();
  // };

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
    setForm(fee);
    setEditingId(fee._id);
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
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `/api/admin/fee-structures/${editingId}`
      : "/api/admin/fee-structures";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    toast({ title: "Saved successfully" });
    setOpen(false);
    setEditingId(null);
    mutate();
  };

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
                    setForm((p) => ({ ...p, classId: v, sectionId: null }))
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
                  value={form.sectionId || ""}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, sectionId: v || null }))
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
            feeStructures={feeStructures}
          />
        </CardContent>
      </Card>
    </div>
  );
}
