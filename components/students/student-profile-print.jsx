"use client";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function StudentProfilePrint({ studentId }) {
  // 1. Fetch Student Data
  const { data: student, isLoading: studentLoading } = useSWR(
    `/api/students/${studentId}`,
    fetcher
  );


  // const { data: attendanceLogs, isLoading: attLoading } = useSWR(
  //   student
  //     ? `/api/attendance?classId=${student.classId?._id}&sectionId=${student.sectionId}&startDate=${firstDay}&endDate=${lastDay}`
  //     : null,
  //   fetcher
  // );


  console.log(student);

  // 2. Fetch Attendance (Only if student data is available)
  // We fetch by classId and sectionId to get relevant logs
  const { data: attendanceLogs, isLoading: attLoading } = useSWR(
    student
      ? `/api/attendance?classId=${student.classId._id}&sectionId=${student.sectionId}`
      : null,
    fetcher
  );

  console.log(attendanceLogs?.attendance);

  if (studentLoading) return <p className="p-6">Loading...</p>;
  if (!student) return <p>Student not found</p>;

  // 3. Filter attendance records for this specific student
  const studentAttendance =
    attendanceLogs?.attendance
      ?.map((day) => {
        const record = day.records.find((r) => r.personId === studentId);
        return {
          date: day.date,
          status: record?.status || "N/A",
        };
      })
      .filter((item) => item.status !== "N/A") || [];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black print:p-0">
      {/* Print Button */}
      <div className="flex justify-end print:hidden mb-4">
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      {/* Header */}
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <p className="text-sm">Academic Record - 2026</p>
      </div>

      <div className="flex justify-between items-start mb-6">
        <section className="grid grid-cols-2 gap-4 text-sm flex-1">
          <Info label="Name" value={student.name} />
          <Info label="Roll No" value={student.rollNumber} />
          <Info label="Class" value={student.classId?.name} />
          <Info label="Section" value={student.sectionId} />
          <Info label="Father Name" value={student.fatherName} />
          <Info label="Phone" value={student.phone} />
        </section>

        <QRCodeSVG
          value={`${process.env.NEXT_PUBLIC_APP_URL}/verify/student/${student._id}`}
          size={80}
        />
      </div>

      {/* Attendance Summary Section */}
      <Section title="Recent Attendance History">
        {attLoading ? (
          <p>Loading attendance...</p>
        ) : (
          <table className="w-full text-sm mt-2 border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Date</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {studentAttendance.slice(0, 10).map((log, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-1">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td
                    className={`py-1 font-medium ${
                      log.status === "Absent" ? "text-red-600" : ""
                    }`}
                  >
                    {log.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Footer */}
      <div className="mt-12 flex justify-between text-xs pt-8 border-t">
        <p>Generated on: {new Date().toLocaleDateString()}</p>
        <p>Class Teacher Signature: ____________________</p>
      </div>
    </div>
  );
}

// Sub-components kept as per your original design
function Section({ title, children }) {
  return (
    <div className="mt-6">
      <h2 className="font-semibold border-b mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
