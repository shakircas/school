"use client";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  IndianRupee,
  Layers,
  Badge,
} from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";

const feeLabels = {
  tuitionFee: "Tuition",
  admissionFee: "Admission",
  examFee: "Exam",
  labFee: "Lab",
  libraryFee: "Library",
  sportsFee: "Sports",
  transportFee: "Transport",
  computerFee: "Computer",
  otherFee: "Other",
};

export function FeeStructureTable({ feeStructures, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead />
          <TableHead>Academic Year</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Section</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {feeStructures?.map((f) => {
          const total = Object.values(f.fees).reduce((s, v) => s + v, 0);
          const isOpen = expanded === f._id;

          return (
            <>
              {/* MAIN ROW */}
              <TableRow key={f._id} className="hover:bg-muted/50">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpanded(isOpen ? null : f._id)}
                  >
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </TableCell>

                <TableCell>{f.academicYear}</TableCell>

                <TableCell>
                  {/* <Badge >{f.className}</Badge> */}
                  <p>{f.className}</p>
                </TableCell>

                <TableCell>{f.sectionName || "All Sections"}</TableCell>

                <TableCell className="font-semibold text-primary">
                  Rs. {total.toLocaleString()}
                </TableCell>

                <TableCell className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(f)}>
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => onDelete(f._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>

              {/* EXPANDED ROW */}
              {isOpen && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={5}>
                    <div className="p-4 rounded-lg space-y-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Layers className="h-4 w-4" />
                        Fee Breakdown
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(f.fees).map(([key, val]) => (
                          <div
                            key={key}
                            className="p-3 rounded-lg border bg-background"
                          >
                            <div className="text-sm text-muted-foreground">
                              {feeLabels[key]}
                            </div>
                            <div className="flex items-center gap-1 font-semibold">
                              <IndianRupee className="h-4 w-4" />
                              {val.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end font-bold text-primary">
                        Total: Rs. {total.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
}
