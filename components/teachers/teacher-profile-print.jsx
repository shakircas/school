"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function TeacherProfilePrint({ teacher }) {
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
        <h1 className="text-2xl font-bold">Teacher Profile</h1>
        <p className="text-sm">Official Record</p>
      </div>

      {/* Basic Info */}
      <section className="grid grid-cols-2 gap-4 text-sm">
        <Info label="Name" value={teacher.name} />
        <Info label="Personal No" value={teacher.personalNo} />
        <Info label="Designation" value={teacher.designation} />
        <Info label="Status" value={teacher.status} />
        <Info label="Phone" value={teacher.phone} />
        <Info label="Email" value={teacher.email} />
        <Info
          label="Joining Date"
          value={new Date(teacher.joiningDate).toLocaleDateString()}
        />
        <Info label="Experience" value={teacher.experience} />
      </section>

      {/* Academic Info */}
      <Section title="Academic Information">
        <Info label="Qualification" value={teacher.qualification} />
        <Info label="Salary" value={`Rs. ${teacher.salary || "-"}`} />
      </Section>

      {/* Footer */}
      <div className="mt-12 flex justify-between text-xs">
        <p>Generated on: {new Date().toLocaleDateString()}</p>
        <p>Principal Signature: ____________________</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-6">
      <h2 className="font-semibold border-b mb-2">{title}</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">{children}</div>
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
