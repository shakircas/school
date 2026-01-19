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
import { academicYears } from "@/lib/constants";

export default function TeacherRegisterSelector() {
  const router = useRouter();

  const currentDate = new Date();
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1));
  const [year, setYear] = useState(String(currentDate.getFullYear()));

  const canProceed = Boolean(month && year);

  const handleGenerate = () => {
    if (!canProceed) return;

    router.push(
      `/attendance/teacher-register/print?month=${month}&year=${year}`
    );
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Teacher Attendance Register</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Month */}
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }).map((_, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {new Date(2000, i).toLocaleString("default", {
                  month: "long",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year */}
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {["2022", "2023", "2024", "2025", "2026", "2027", "2028"].map(
              (y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        {/* Action */}
        <Button
          disabled={!canProceed}
          onClick={handleGenerate}
          className="w-full"
        >
          Generate Register
        </Button>
      </CardContent>
    </Card>
  );
}
