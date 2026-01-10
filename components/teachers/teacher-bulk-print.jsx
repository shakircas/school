"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function TeacherBulkPrint() {
  const { data, isLoading } = useSWR(`/api/teachers?status=Active`, fetcher);

  if (isLoading) return <p className="p-6">Loading...</p>;

  const teachers = data?.teachers || [];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white text-black">
      {/* Print Button */}
      <div className="flex justify-end print:hidden mb-4">
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print All
        </Button>
      </div>

      {teachers.map((t, idx) => (
        <div key={t._id} className="page-break mb-10">
          <h2 className="text-xl font-bold mb-2">Teacher Profile</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Name" value={t.name} />
            <Info label="Personal No" value={t.personalNo} />
            <Info label="Designation" value={t.designation} />
            <Info label="Phone" value={t.phone} />
            <Info label="Email" value={t.email} />
            <Info label="Status" value={t.status} />
          </div>

          <div className="mt-8 text-xs flex justify-between">
            <span>Record #{idx + 1}</span>
            <span>Signature: ____________________</span>
          </div>
        </div>
      ))}
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
