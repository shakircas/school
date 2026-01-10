"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function StudentBulkPrint() {
  const { data, isLoading } = useSWR("/api/students?status=Active", fetcher);

  if (isLoading) return <p className="p-6">Loading…</p>;

  const students = data?.students || [];

  return (
    <div className="bg-white text-black p-6 max-w-5xl mx-auto">
      <div className="flex justify-end print:hidden mb-4">
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print All Students
        </Button>
      </div>

      {students.map((s, i) => (
        <div key={s._id} className=" mb-10">
          <h2 className="text-xl font-bold text-center mb-4">
            Student Profile
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Name" value={s.name} />
            <Field label="Roll No" value={s.rollNumber} />
            <Field label="Class" value={s.classId?.name} />
            <Field label="Section" value={s.sectionId} />
            <Field label="Father Name" value={s.fatherName} />
            <Field label="Phone" value={s.phone} />
            <Field label="Status" value={s.status} />
          </div>

          <div className="mt-8 flex justify-between text-xs">
            <span>Record #{i + 1}</span>
            <span>Signature: _____________</span>
          </div>
          <hr className="mt-2 color-black"/>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
