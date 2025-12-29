"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentResults() {
  const { data } = useSWR("/api/quizzes/attempts?student=me");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My Results</h1>

      {data?.attempts.map((a) => (
        <Card key={a._id}>
          <CardHeader>
            <CardTitle>{a.quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between">
            <span>
              {a.obtainedMarks}/{a.totalMarks}
            </span>
            <span>{a.grade}</span>
            <span>{a.percentage}%</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
