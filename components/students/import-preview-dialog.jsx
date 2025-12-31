// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableCell,
//   TableBody,
//   TableHead,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";

// export function ImportPreviewDialog({ open, data, onConfirm, onClose }) {
//   if (!data?.length) return null;

//   const headers = Object.keys(data[0]);

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-auto">
//         <DialogHeader>
//           <DialogTitle>Import Preview</DialogTitle>
//         </DialogHeader>

//         <ScrollArea className="h-[400px] border rounded">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 {Object.keys(data[0]).map((key) => (
//                   <TableHead key={key}>{key}</TableHead>
//                 ))}
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {data.map((row, i) => (
//                 <TableRow key={i}>
//                   {Object.values(row).map((val, j) => (
//                     <TableCell key={j}>{val || "—"}</TableCell>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </ScrollArea>

//         <div className="flex justify-end gap-2 mt-4">
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button onClick={onConfirm}>Confirm Import</Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClasses } from "../hooks/useClasses";

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
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Import Preview</DialogTitle>
        </DialogHeader>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Roll</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          {validated.map((row, i) => (
            <TableRow key={i} className={row.__error ? "bg-red-50" : ""}>
              <TableCell>{row.rollNumber}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.class}</TableCell>
              <TableCell>{row.section}</TableCell>
              <TableCell>
                {row.__error ? (
                  <Badge variant="destructive">{row.__error}</Badge>
                ) : (
                  <Badge variant="success">OK</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={hasErrors} onClick={onConfirm}>
            Import Students
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
