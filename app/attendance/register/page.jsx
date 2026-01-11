"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import { MainLayout } from "@/components/layout/main-layout";

const fetcher = (url) => fetch(url).then((res) => res.json());

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function AttendanceRegisterSelectorPage() {
  const router = useRouter();

  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());

  /* Fetch Classes */
  const { data: classesData, isLoading } = useSWR(
    "/api/academics/classes",
    fetcher
  );

  const classes = classesData?.data || [];

  const selectedClass = classes.find((c) => c._id === classId);
  const sections = selectedClass?.sections || [];

  const canProceed = classId && sectionId && month && year;

  const handleGenerate = () => {
    if (!canProceed) return;

    router.push(
      `/attendance/register/print?classId=${classId}&sectionId=${sectionId}&month=${month}&year=${year}`
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Attendance Register"
          description="Select class, section and month to generate register"
        />

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Register Options</CardTitle>
            <CardDescription>
              All fields are required to generate register
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Class */}
            <div className="space-y-1">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section */}
            <div className="space-y-1">
              <Label>Section</Label>
              <Select
                value={sectionId}
                onValueChange={setSectionId}
                disabled={!classId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .find((c) => c._id === classId)
                    ?.sections?.map((s) => (
                      <SelectItem key={s._id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month */}
            <div className="space-y-1">
              <Label>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-1">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full mt-4"
              disabled={!canProceed}
              onClick={handleGenerate}
            >
              Generate Attendance Register
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
