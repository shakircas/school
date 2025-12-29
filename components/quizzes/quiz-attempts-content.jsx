"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function QuizAttemptsContent() {
  const router = useRouter();

  const { data, isLoading } = useSWR("/api/quizzes/attempts", fetcher);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const attempts = data?.attempts || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quiz Attempts</h1>

      {attempts.length === 0 && (
        <p className="text-muted-foreground">No quiz attempts found</p>
      )}

      <div className="grid gap-4">
        {attempts.map((attempt) => (
          <Card key={attempt._id}>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-lg">{attempt.quiz?.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {attempt.quiz?.subject} — Class {attempt.quiz?.class}
                </p>
              </div>

              <Badge
                variant={attempt.percentage >= 50 ? "success" : "destructive"}
              >
                {attempt.grade}
              </Badge>
            </CardHeader>

            <CardContent className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student</p>
                <p className="font-medium">{attempt.studentName || "—"}</p>
                <p className="text-sm">Roll No: {attempt.rollNumber || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Marks</p>
                <p className="font-medium">
                  {attempt.obtainedMarks} / {attempt.totalMarks}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Percentage</p>
                <p className="font-medium">{attempt.percentage}%</p>
              </div>

              <div className="flex items-end justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/quizzes/attempts/${attempt._id}`)
                  }
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
