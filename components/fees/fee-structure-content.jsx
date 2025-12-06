"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Save } from "lucide-react"

const initialFeeStructure = [
  { id: "1", class: "1", tuitionFee: 8000, admissionFee: 5000, examFee: 1000, labFee: 0, sportsFee: 500, total: 14500 },
  { id: "2", class: "2", tuitionFee: 8500, admissionFee: 5000, examFee: 1000, labFee: 0, sportsFee: 500, total: 15000 },
  { id: "3", class: "3", tuitionFee: 9000, admissionFee: 5000, examFee: 1000, labFee: 0, sportsFee: 500, total: 15500 },
  { id: "4", class: "4", tuitionFee: 9500, admissionFee: 5000, examFee: 1000, labFee: 0, sportsFee: 500, total: 16000 },
  {
    id: "5",
    class: "5",
    tuitionFee: 10000,
    admissionFee: 5000,
    examFee: 1000,
    labFee: 0,
    sportsFee: 500,
    total: 16500,
  },
  {
    id: "6",
    class: "6",
    tuitionFee: 10500,
    admissionFee: 5000,
    examFee: 1200,
    labFee: 1000,
    sportsFee: 500,
    total: 18200,
  },
  {
    id: "7",
    class: "7",
    tuitionFee: 11000,
    admissionFee: 5000,
    examFee: 1200,
    labFee: 1000,
    sportsFee: 500,
    total: 18700,
  },
  {
    id: "8",
    class: "8",
    tuitionFee: 11500,
    admissionFee: 5000,
    examFee: 1200,
    labFee: 1000,
    sportsFee: 500,
    total: 19200,
  },
  {
    id: "9",
    class: "9",
    tuitionFee: 12000,
    admissionFee: 5000,
    examFee: 1500,
    labFee: 1500,
    sportsFee: 500,
    total: 20500,
  },
  {
    id: "10",
    class: "10",
    tuitionFee: 12500,
    admissionFee: 5000,
    examFee: 1500,
    labFee: 1500,
    sportsFee: 500,
    total: 21000,
  },
]

export function FeeStructureContent() {
  const { toast } = useToast()
  const [feeStructure, setFeeStructure] = useState(initialFeeStructure)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState(null)
  const [formData, setFormData] = useState({
    class: "",
    tuitionFee: "",
    admissionFee: "",
    examFee: "",
    labFee: "",
    sportsFee: "",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateTotal = () => {
    const { tuitionFee, admissionFee, examFee, labFee, sportsFee } = formData
    return (
      (Number.parseFloat(tuitionFee) || 0) +
      (Number.parseFloat(admissionFee) || 0) +
      (Number.parseFloat(examFee) || 0) +
      (Number.parseFloat(labFee) || 0) +
      (Number.parseFloat(sportsFee) || 0)
    )
  }

  const handleSave = () => {
    const total = calculateTotal()
    const newFee = {
      id: editingFee?.id || Date.now().toString(),
      class: formData.class,
      tuitionFee: Number.parseFloat(formData.tuitionFee) || 0,
      admissionFee: Number.parseFloat(formData.admissionFee) || 0,
      examFee: Number.parseFloat(formData.examFee) || 0,
      labFee: Number.parseFloat(formData.labFee) || 0,
      sportsFee: Number.parseFloat(formData.sportsFee) || 0,
      total,
    }

    if (editingFee) {
      setFeeStructure((prev) => prev.map((f) => (f.id === editingFee.id ? newFee : f)))
      toast({ title: "Fee Updated", description: `Fee structure for Class ${formData.class} has been updated.` })
    } else {
      setFeeStructure((prev) => [...prev, newFee])
      toast({ title: "Fee Added", description: `Fee structure for Class ${formData.class} has been added.` })
    }

    setIsDialogOpen(false)
    setEditingFee(null)
    setFormData({ class: "", tuitionFee: "", admissionFee: "", examFee: "", labFee: "", sportsFee: "" })
  }

  const handleEdit = (fee) => {
    setEditingFee(fee)
    setFormData({
      class: fee.class,
      tuitionFee: fee.tuitionFee.toString(),
      admissionFee: fee.admissionFee.toString(),
      examFee: fee.examFee.toString(),
      labFee: fee.labFee.toString(),
      sportsFee: fee.sportsFee.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id) => {
    setFeeStructure((prev) => prev.filter((f) => f.id !== id))
    toast({ title: "Fee Deleted", description: "Fee structure has been removed." })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Fee Structure" description="Define and manage fee structure for each class">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFee ? "Edit" : "Add"} Fee Structure</DialogTitle>
              <DialogDescription>Define the fee structure for a class</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={formData.class} onValueChange={(v) => handleInputChange("class", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                        <SelectItem key={c} value={c.toString()}>
                          Class {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tuition Fee</Label>
                  <Input
                    type="number"
                    value={formData.tuitionFee}
                    onChange={(e) => handleInputChange("tuitionFee", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admission Fee</Label>
                  <Input
                    type="number"
                    value={formData.admissionFee}
                    onChange={(e) => handleInputChange("admissionFee", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exam Fee</Label>
                  <Input
                    type="number"
                    value={formData.examFee}
                    onChange={(e) => handleInputChange("examFee", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lab Fee</Label>
                  <Input
                    type="number"
                    value={formData.labFee}
                    onChange={(e) => handleInputChange("labFee", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sports Fee</Label>
                  <Input
                    type="number"
                    value={formData.sportsFee}
                    onChange={(e) => handleInputChange("sportsFee", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Fee</span>
                  <span className="text-xl font-bold text-primary">Rs. {calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

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
                  <TableHead className="text-right">Tuition Fee</TableHead>
                  <TableHead className="text-right">Admission Fee</TableHead>
                  <TableHead className="text-right">Exam Fee</TableHead>
                  <TableHead className="text-right">Lab Fee</TableHead>
                  <TableHead className="text-right">Sports Fee</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeStructure.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <Badge variant="outline">Class {fee.class}</Badge>
                    </TableCell>
                    <TableCell className="text-right">Rs. {fee.tuitionFee.toLocaleString()}</TableCell>
                    <TableCell className="text-right">Rs. {fee.admissionFee.toLocaleString()}</TableCell>
                    <TableCell className="text-right">Rs. {fee.examFee.toLocaleString()}</TableCell>
                    <TableCell className="text-right">Rs. {fee.labFee.toLocaleString()}</TableCell>
                    <TableCell className="text-right">Rs. {fee.sportsFee.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      Rs. {fee.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(fee)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(fee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
