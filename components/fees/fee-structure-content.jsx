// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { PageHeader } from "@/components/ui/page-header"
// import { useToast } from "@/hooks/use-toast"
// import { Plus, Edit, Trash2, Save } from "lucide-react"

// export function FeeStructureContent() {
//   const { toast } = useToast()
//   const [feeStructure, setFeeStructure] = useState(initialFeeStructure)
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [editingFee, setEditingFee] = useState(null)
//  const [formData, setFormData] = useState({
//    classId: "",
//    sectionId: null,
//    academicYear: "2024-2025",
//    fees: {
//      tuitionFee: 0,
//      admissionFee: 0,
//      examFee: 0,
//      labFee: 0,
//      libraryFee: 0,
//      sportsFee: 0,
//      transportFee: 0,
//      computerFee: 0,
//      otherFee: 0,
//    },
//    isMonthly: true,
//    applicableMonths: [],
//    remarks: "",
//  });

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   const calculateTotal = () => {
//     const { tuitionFee, admissionFee, examFee, labFee, sportsFee } = formData
//     return (
//       (Number.parseFloat(tuitionFee) || 0) +
//       (Number.parseFloat(admissionFee) || 0) +
//       (Number.parseFloat(examFee) || 0) +
//       (Number.parseFloat(labFee) || 0) +
//       (Number.parseFloat(sportsFee) || 0)
//     )
//   }

//   // const handleSave = () => {
//   //   const total = calculateTotal()
//   //   const newFee = {
//   //     id: editingFee?.id || Date.now().toString(),
//   //     class: formData.class,
//   //     tuitionFee: Number.parseFloat(formData.tuitionFee) || 0,
//   //     admissionFee: Number.parseFloat(formData.admissionFee) || 0,
//   //     examFee: Number.parseFloat(formData.examFee) || 0,
//   //     labFee: Number.parseFloat(formData.labFee) || 0,
//   //     sportsFee: Number.parseFloat(formData.sportsFee) || 0,
//   //     total,
//   //   }

//   //   if (editingFee) {
//   //     setFeeStructure((prev) => prev.map((f) => (f.id === editingFee.id ? newFee : f)))
//   //     toast({ title: "Fee Updated", description: `Fee structure for Class ${formData.class} has been updated.` })
//   //   } else {
//   //     setFeeStructure((prev) => [...prev, newFee])
//   //     toast({ title: "Fee Added", description: `Fee structure for Class ${formData.class} has been added.` })
//   //   }

//   //   setIsDialogOpen(false)
//   //   setEditingFee(null)
//   //   setFormData({ class: "", tuitionFee: "", admissionFee: "", examFee: "", labFee: "", sportsFee: "" })
//   // }

// const handleSave = async () => {
//   const payload = {
//     classId: formData.classId,
//     sectionId: formData.sectionId || null,
//     academicYear: formData.academicYear,
//     fees: formData.fees,
//     isMonthly: formData.isMonthly,
//     applicableMonths: formData.applicableMonths,
//     remarks: formData.remarks,
//   };

//   const res = await fetch("/api/fee-structure", {
//     method: editingFee ? "PUT" : "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   if (!res.ok) {
//     toast({ title: "Save failed", variant: "destructive" });
//     return;
//   }

//   toast({ title: "Fee Structure Saved" });
//   setIsDialogOpen(false);
// };

//   const handleEdit = (fee) => {
//     setEditingFee(fee)
//     setFormData({
//       class: fee.class,
//       tuitionFee: fee.tuitionFee.toString(),
//       admissionFee: fee.admissionFee.toString(),
//       examFee: fee.examFee.toString(),
//       labFee: fee.labFee.toString(),
//       sportsFee: fee.sportsFee.toString(),
//     })
//     setIsDialogOpen(true)
//   }

//   const handleDelete = (id) => {
//     setFeeStructure((prev) => prev.filter((f) => f.id !== id))
//     toast({ title: "Fee Deleted", description: "Fee structure has been removed." })
//   }

//   return (
//     <div className="space-y-6">
//       <PageHeader title="Fee Structure" description="Define and manage fee structure for each class">
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="h-4 w-4 mr-2" />
//               Add Fee Structure
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>{editingFee ? "Edit" : "Add"} Fee Structure</DialogTitle>
//               <DialogDescription>Define the fee structure for a class</DialogDescription>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Class</Label>
//                   <Select value={formData.class} onValueChange={(v) => handleInputChange("class", v)}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select class" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
//                         <SelectItem key={c} value={c.toString()}>
//                           Class {c}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Tuition Fee</Label>
//                   <Input
//                     type="number"
//                     value={formData.tuitionFee}
//                     onChange={(e) => handleInputChange("tuitionFee", e.target.value)}
//                     placeholder="0"
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Admission Fee</Label>
//                   <Input
//                     type="number"
//                     value={formData.admissionFee}
//                     onChange={(e) => handleInputChange("admissionFee", e.target.value)}
//                     placeholder="0"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Exam Fee</Label>
//                   <Input
//                     type="number"
//                     value={formData.examFee}
//                     onChange={(e) => handleInputChange("examFee", e.target.value)}
//                     placeholder="0"
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Lab Fee</Label>
//                   <Input
//                     type="number"
//                     value={formData.labFee}
//                     onChange={(e) => handleInputChange("labFee", e.target.value)}
//                     placeholder="0"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Sports Fee</Label>
//                   <Input
//                     type="number"
//                     value={formData.sportsFee}
//                     onChange={(e) => handleInputChange("sportsFee", e.target.value)}
//                     placeholder="0"
//                   />
//                 </div>
//               </div>
//               <div className="p-4 bg-muted rounded-lg">
//                 <div className="flex items-center justify-between">
//                   <span className="font-medium">Total Fee</span>
//                   <span className="text-xl font-bold text-primary">Rs. {calculateTotal().toLocaleString()}</span>
//                 </div>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleSave}>
//                 <Save className="h-4 w-4 mr-2" />
//                 Save
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </PageHeader>

//       <Card>
//         <CardHeader>
//           <CardTitle>Fee Structure by Class</CardTitle>
//           <CardDescription>Annual fee breakdown for each class</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Class</TableHead>
//                   <TableHead className="text-right">Tuition Fee</TableHead>
//                   <TableHead className="text-right">Admission Fee</TableHead>
//                   <TableHead className="text-right">Exam Fee</TableHead>
//                   <TableHead className="text-right">Lab Fee</TableHead>
//                   <TableHead className="text-right">Sports Fee</TableHead>
//                   <TableHead className="text-right">Total</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {feeStructure.map((fee) => (
//                   <TableRow key={fee.id}>
//                     <TableCell>
//                       <Badge variant="outline">Class {fee.class}</Badge>
//                     </TableCell>
//                     <TableCell className="text-right">Rs. {fee.tuitionFee.toLocaleString()}</TableCell>
//                     <TableCell className="text-right">Rs. {fee.admissionFee.toLocaleString()}</TableCell>
//                     <TableCell className="text-right">Rs. {fee.examFee.toLocaleString()}</TableCell>
//                     <TableCell className="text-right">Rs. {fee.labFee.toLocaleString()}</TableCell>
//                     <TableCell className="text-right">Rs. {fee.sportsFee.toLocaleString()}</TableCell>
//                     <TableCell className="text-right font-bold text-primary">
//                       Rs. {fee.total.toLocaleString()}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex items-center justify-end gap-1">
//                         <Button size="icon" variant="ghost" onClick={() => handleEdit(fee)}>
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="text-destructive"
//                           onClick={() => handleDelete(fee.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

"use client";

import { useState, useEffect } from "react";
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
import { Plus, Save } from "lucide-react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function FeeStructureContent() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
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
  });

  // Fetch classes
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
  const classes = classesRes?.data || [];

  // Fetch fee structures
  const { data: feesRes, mutate } = useSWR(
    "/api/admin/fee-structures",
    fetcher
  );

  const feeStructures = feesRes?.data || [];

  // Update individual fee field
  const updateFee = (key, value) => {
    setForm((p) => ({
      ...p,
      fees: { ...p.fees, [key]: Number(value || 0) },
    }));
  };

  // Total calculation
  const total = Object.values(form.fees).reduce((s, v) => s + v, 0);

  // Save fee structure
  const save = async () => {
    if (!form.classId) {
      toast({ title: "Select class", variant: "destructive" });
      return;
    }

    const res = await fetch("/api/admin/fee-structures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      toast({ title: "Save failed", variant: "destructive" });
      return;
    }

    toast({ title: "Fee Structure Saved" });
    setOpen(false);
    mutate(); // Refresh fee structures
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structure"
        description="Define class / section wise fee structure"
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Fee Structure
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Fee Structure</DialogTitle>
            </DialogHeader>

            {/* Class & Section */}
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
                    {Array.isArray(classes) &&
                      classes.map((cls) => (
                        <SelectItem key={cls._id} value={cls._id}>
                          {cls.name}
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
                      ?.sections.map((s) => (
                        <SelectItem key={s._id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fees */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {Object.keys(form.fees).map((key) => (
                <div key={key}>
                  <Label>{key.replace(/Fee$/, " Fee")}</Label>
                  <Input
                    type="number"
                    value={form.fees[key]}
                    onChange={(e) => updateFee(key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold text-primary">
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

      {/* Fee Structure Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structure by Class</CardTitle>
          <CardDescription>Annual fee breakdown for each class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Total Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeStructures.map((f) => {
                  const total = Object.values(f.fees).reduce(
                    (s, v) => s + v,
                    0
                  );
                  return (
                    <TableRow key={f._id}>
                      <TableCell>
                        <Badge variant="outline">{f.className}</Badge>
                      </TableCell>
                      <TableCell>{f.sectionName || "All Sections"}</TableCell>
                      <TableCell>Rs. {total.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

