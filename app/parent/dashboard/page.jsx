"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/card";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ParentDashboard() {
  const { data } = useSWR("/api/parent/students", fetcher);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Children</h1>

      {data?.students.map((s) => (
        <Card key={s._id} className="p-4">
          <p className="font-semibold">{s.name}</p>
          <p>Class: {s.class}</p>
          <p>Roll: {s.rollNumber}</p>
        </Card>
      ))}
    </div>
  );
}
