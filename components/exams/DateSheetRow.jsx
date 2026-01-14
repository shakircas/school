// "use client";

// import { Badge } from "@/components/ui/badge";
// import { TableRow, TableCell } from "@/components/ui/table";
// import { Clock, MapPin, AlertCircle } from "lucide-react";
// import { useMemo } from "react";

// export function DateSheetRow({ item }) {
//   // 1. Check if the exam date is TODAY
//   const isToday = useMemo(() => {
//     if (!item.date) return false;
//     const today = new Date();
//     const examDate = new Date(item.date);

//     return (
//       today.getDate() === examDate.getDate() &&
//       today.getMonth() === examDate.getMonth() &&
//       today.getFullYear() === examDate.getFullYear()
//     );
//   }, [item.date]);

//   return (
//     <TableRow
//       className={`transition-colors ${
//         isToday
//           ? "bg-red-50/80 hover:bg-red-50 border-l-4 border-l-red-500"
//           : "hover:bg-slate-50/50"
//       }`}
//     >
//       <TableCell className="font-medium">
//         {item.date ? new Date(item.date).toLocaleDateString("en-GB") : "-"}
//       </TableCell>

//       <TableCell>
//         <div className="flex flex-col">
//           <span
//             className={isToday ? "font-bold text-red-600" : "text-slate-600"}
//           >
//             {item.date
//               ? new Date(item.date).toLocaleDateString("en-US", {
//                   weekday: "long",
//                 })
//               : "-"}
//           </span>
//           {isToday && (
//             <Badge className="w-fit h-4 text-[9px] bg-red-500 animate-pulse uppercase">
//               Today
//             </Badge>
//           )}
//         </div>
//       </TableCell>

//       <TableCell
//         className={`font-bold ${isToday ? "text-red-700" : "text-slate-900"}`}
//       >
//         {item.subject}
//       </TableCell>

//       <TableCell>
//         <div className="flex items-center gap-1.5 text-slate-600">
//           <Clock className="h-3 w-3" />
//           {item.startTime} — {item.endTime}
//         </div>
//       </TableCell>

//       <TableCell>
//         <div className="flex items-center gap-1.5">
//           <span className="text-sm font-medium">
//             {item.invigilator?.name || "TBA"}
//           </span>
//         </div>
//       </TableCell>

//       <TableCell className="text-right font-mono text-xs">
//         <span className="text-slate-400">Passing:</span> {item.passingMarks}
//       </TableCell>
//     </TableRow>
//   );
// }

"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Clock, CheckCircle2, Timer, AlertCircle } from "lucide-react";

export function DateSheetRow({ item }) {
  const { isToday, status } = useMemo(() => {
    if (!item.date) return { isToday: false, status: "TBA" };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
    const examDate = new Date(item.date);
    examDate.setHours(0, 0, 0, 0);

    const isToday = today.getTime() === examDate.getTime();

    let status = "Upcoming";
    if (isToday) status = "Today";
    else if (today > examDate) status = "Completed";

    return { isToday, status };
  }, [item.date]);

  // Status Badge Styling
  const getStatusStyles = (status) => {
    switch (status) {
      case "Today":
        return "bg-red-100 text-red-700 border-red-200 animate-pulse";
      case "Completed":
        return "bg-slate-100 text-slate-500 border-slate-200 opacity-70";
      default:
        return "bg-blue-50 text-blue-700 border-blue-100";
    }
  };

  return (
    <TableRow
      className={`transition-all ${
        isToday
          ? "bg-red-50/50 hover:bg-red-50 border-l-4 border-l-red-500"
          : status === "Completed"
          ? "bg-slate-50/30 grayscale-[0.5]"
          : "hover:bg-slate-50/50"
      }`}
    >
      {/* Date & Day */}
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">
            {item.date ? new Date(item.date).toLocaleDateString("en-GB") : "-"}
          </span>
          <span className="text-[11px] text-slate-500">
            {item.date
              ? new Date(item.date).toLocaleDateString("en-US", {
                  weekday: "long",
                })
              : "-"}
          </span>
        </div>
      </TableCell>

      {/* Subject */}
      <TableCell
        className={`font-bold ${isToday ? "text-red-700" : "text-slate-900"}`}
      >
        {item.subject}
      </TableCell>

      {/* Timing */}
      <TableCell>
        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {item.startTime} — {item.endTime}
        </div>
      </TableCell>

      {/* Status Column */}
      <TableCell>
        <Badge
          variant="outline"
          className={`gap-1 px-2 py-0.5 font-semibold tracking-tight ${getStatusStyles(
            status
          )}`}
        >
          {status === "Today" && <AlertCircle className="h-3 w-3" />}
          {status === "Completed" && <CheckCircle2 className="h-3 w-3" />}
          {status === "Upcoming" && <Timer className="h-3 w-3" />}
          {status}
        </Badge>
      </TableCell>

      {/* Invigilator */}
      <TableCell>
        <span className="text-sm text-slate-600 font-medium">
          {item.invigilator?.name || "Not Assigned"}
        </span>
      </TableCell>

      {/* Marks */}
      <TableCell className="text-right">
        <div className="text-xs font-mono">
          <span className="text-slate-900 font-bold">{item.totalMarks}</span>
          <span className="text-slate-400 mx-1">/</span>
          <span className="text-slate-500">{item.passingMarks}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}