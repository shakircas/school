"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function TeacherRegisterSelector() {
  const router = useRouter();
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const canProceed = month && year;

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Teacher Attendance Register</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {[...Array(12)].map((_, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year} onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {[2023, 2024, 2025, 2026].map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          disabled={!canProceed}
          onClick={() =>
            router.push(
              `/attendance/teacher-register/print?month=${month}&year=${year}`
            )
          }
          className="w-full"
        >
          Generate Register
        </Button>
      </CardContent>
    </Card>
  );
}
