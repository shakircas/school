"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react"; // For SVG (recommended for printing)

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function StudentProfilePrint({ studentId }) {
  const { data, isLoading } = useSWR(`/api/students/${studentId}`, fetcher);

  if (isLoading) return <p className="p-6">Loading...</p>;
  console.log(data);
  const student = data;
  if (!student) return <p>Student not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black print:p-0">
      {/* Print Button */}
      <div className="flex justify-end print:hidden mb-4">
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>
      {/* Header */}
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <p className="text-sm">Academic Record</p>
      </div>

      <QRCodeSVG
        value={`${process.env.NEXT_PUBLIC_APP_URL}/verify/student/${student._id} ${student.name} ${student.rollNumber}`}
        size={80}
      />
      {/* Student Info */}
      <section className="grid grid-cols-2 gap-4 text-sm">
        <Info label="Name" value={student.name} />
        <Info label="Roll No" value={student.rollNumber} />
        <Info label="Class" value={student.classId?.name} />
        <Info label="Section" value={student.sectionId} />
        <Info label="Father Name" value={student.fatherName} />
        <Info label="Phone" value={student.phone} />
        <Info label="Gender" value={student.gender} />
        <Info
          label="Date of Birth"
          value={new Date(student.dateOfBirth).toLocaleDateString()}
        />
        <Info
          label="Admission Date"
          value={new Date(student.admissionDate).toLocaleDateString()}
        />
        <Info label="Status" value={student.status} />
      </section>
      {/* Address */}
      <Section title="Address">
        <p className="text-sm">{student.address.country || "-"}</p>
      </Section>
      {/* Footer */}
      <div className="mt-12 flex justify-between text-xs">
        <p>Generated on: {new Date().toLocaleDateString()}</p>
        <p>Class Teacher Signature: ____________________</p>
      </div>
    </div>
  );
}

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
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
