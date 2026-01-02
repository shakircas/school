import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle } from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import { exportToExcel } from "@/lib/exportToExcel";

export function ImportPreviewDialog({ open, data, onConfirm, onClose }) {
  const { classes } = useClasses();

  const validated = data.map((row) => {
    const classExists = classes?.some((c) => c.name === row.class);

    return {
      ...row,
      __error: classExists ? null : "Invalid class",
    };
  });

  const hasErrors = validated.some((r) => r.__error);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Import Preview (Excel Style)
          </DialogTitle>
        </DialogHeader>

        {/* Excel-like sheet */}
        <div className="border rounded-md bg-muted/30">
          <ScrollArea className="h-[420px]">
            <Table className="border-collapse text-sm">
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="border w-24">Roll</TableHead>
                  <TableHead className="border">Name</TableHead>
                  <TableHead className="border w-32">Class</TableHead>
                  <TableHead className="border w-28">Section</TableHead>
                  <TableHead className="border w-32">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {validated.map((row, i) => (
                  <TableRow
                    key={i}
                    className={
                      row.__error
                        ? "bg-red-50 hover:bg-red-100"
                        : i % 2 === 0
                        ? "bg-white"
                        : "bg-muted/40"
                    }
                  >
                    <TableCell className="border font-mono">
                      {row.rollNumber}
                    </TableCell>

                    <TableCell className="border">{row.name}</TableCell>

                    <TableCell
                      className={`border ${
                        row.__error ? "text-red-600 font-medium" : ""
                      }`}
                    >
                      {row.class}
                    </TableCell>

                    <TableCell className="border">{row.section}</TableCell>

                    <TableCell className="border">
                      {row.__error ? (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span>{row.__error}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Valid</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            {validated.length} rows •{" "}
            {validated.filter((r) => !r.__error).length} valid •{" "}
            {validated.filter((r) => r.__error).length} errors
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={hasErrors} onClick={onConfirm}>
              Import Students
            </Button>
          </div>
        </div>
      </DialogContent>
      {/* <div className="flex gap-2">
        <Button variant="secondary" onClick={() => exportToExcel(validated)}>
          Download Corrected Excel
        </Button>

        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>

        <Button disabled={hasErrors} onClick={() => onConfirm(rows)}>
          Import Students
        </Button>
      </div> */}
    </Dialog>
  );
}
