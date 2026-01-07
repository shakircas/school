"use client";

import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function FeeVersionComparison({
  classId = "69460b708eeecb6d8ae8a9a8",
  academicYear = "2024-2025",
}) {
  const { data, isLoading } = useSWR(
    classId
      ? `/api/admin/fees/compare?classId=${classId}&academicYear=${academicYear}`
      : null,
    fetcher
  );

  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);
    console.log("fees Data", data);
    const classes = classesRes?.data || [];

  if (!classId) {
    return <p className="text-sm text-muted-foreground">Select a class</p>;
  }

  if (isLoading) return <p>Loading comparison...</p>;
  if (!data?.comparisons?.length) return <p>No comparison data available</p>;

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>Fee Version Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.comparisons.map((comp, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge>Version {comp.fromVersion}</Badge>→
                <Badge variant="secondary">Version {comp.toVersion}</Badge>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Head</TableHead>
                    <TableHead>Old</TableHead>
                    <TableHead>New</TableHead>
                    <TableHead>Difference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(comp.changes).map(([key, val]) => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell>Rs. {val.old}</TableCell>
                      <TableCell>Rs. {val.new}</TableCell>
                      <TableCell
                        className={
                          val.diff > 0 ? "text-red-600" : "text-green-600"
                        }
                      >
                        {val.diff > 0 ? "+" : ""}
                        {val.diff}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
