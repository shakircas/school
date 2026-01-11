import { buildAttendanceMap } from "@/lib/attendance-utils";
import { Badge } from "@/components/ui/badge";

export default function AttendanceTable({
  students,
  attendanceDocs,
  daysInMonth,
  month,
  year,
}) {
  const attendanceMap = buildAttendanceMap(attendanceDocs);

  return (
    <div className="overflow-x-auto border rounded-lg print:border-none">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Roll</th>
            <th className="border p-2">Name</th>

            {[...Array(daysInMonth)].map((_, i) => (
              <th key={i} className="border p-1">
                {i + 1}
              </th>
            ))}

            <th className="border p-2">P</th>
            <th className="border p-2">A</th>
            <th className="border p-2">%</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => {
            let present = 0;
            let absent = 0;

            return (
              <tr key={s._id}>
                <td className="border p-1">{s.rollNumber}</td>
                <td className="border p-1 whitespace-nowrap">{s.name}</td>

                {[...Array(daysInMonth)].map((_, d) => {
                  const status = attendanceMap[d + 1]?.[s._id];

                  if (status === "Present") present++;
                  if (status === "Absent") absent++;

                  return (
                    <td key={d} className="border text-center">
                      {status === "Present" && (
                        <span className="text-green-600 font-bold">P</span>
                      )}
                      {status === "Absent" && (
                        <span className="text-red-600 font-bold">A</span>
                      )}
                    </td>
                  );
                })}

                <td className="border text-center font-bold">{present}</td>
                <td className="border text-center font-bold">{absent}</td>
                <td className="border text-center font-bold">
                  {present + absent === 0
                    ? "-"
                    : Math.round((present / (present + absent)) * 100)}
                  %
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
