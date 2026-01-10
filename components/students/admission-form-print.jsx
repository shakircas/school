"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { LoadingSpinner } from "../ui/loading-spinner";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function AdmissionFormPrint({ studentId }) {
  const { data, isLoading } = useSWR(`/api/students/${studentId}`, fetcher);
  const s = data;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white text-black p-8 max-w-4xl mx-auto">
        <LoadingSpinner />
      </div>
    );
  }

  if (!s) return null;

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto">
      <div className="flex justify-end print:hidden mb-4">
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-center mb-6">Admission Form</h1>

      <section className="grid grid-cols-2 gap-4 text-sm">
        <Field label="Student Name" value={s.name} />
        <Field label="Father Name" value={s.fatherName} />
        <Field label="Class" value={s.classId?.name} />
        <Field label="Section" value={s.sectionId} />
        <Field
          label="DOB"
          value={new Date(s.dateOfBirth).toLocaleDateString()}
        />
        <Field label="Gender" value={s.gender} />
        <Field label="Phone" value={s.phone} />
      </section>

      <div className="mt-8">
        <p className="text-sm">Address:</p>
        <div className="border p-3 mt-1 min-h-[60px]">
          {s.address?.street || "-"}
        </div>
      </div>

      <div className="mt-12 flex justify-between text-sm">
        <span>Parent Signature: _____________</span>
        <span>Office Signature: _____________</span>
      </div>
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
