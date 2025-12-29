"use client";

import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Trash2, RotateCcw } from "lucide-react";
import React from "react";
import { MainLayout } from "@/components/layout/main-layout";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AttemptDetailPage({ params }) {
  const router = useRouter();

  const { id } = useParams();

  const { data, isLoading, mutate } = useSWR(
    `/api/quizzes/attempts/${id}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const attempt = data?.attempt;
  if (!attempt) return null;

  const handleReattempt = async () => {
    if (!confirm("Delete this attempt and re-attempt quiz?")) return;

    await fetch(`/api/quizzes/attempts/${attempt._id}`, {
      method: "DELETE",
    });

    router.push(`/quizzes/${attempt.quiz._id}/start`);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>{attempt.quiz.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {attempt.quiz.subject} — Class {attempt.quiz.class}
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
              <p className="font-medium">{attempt.studentName}</p>
              <p className="text-sm">Roll No: {attempt.rollNumber}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Marks</p>
              <p className="font-medium">
                {attempt.obtainedMarks} / {attempt.totalMarks}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Percentage</p>
              <Progress value={attempt.percentage} />
              <p className="text-sm mt-1">{attempt.percentage}%</p>
            </div>

            <div className="flex items-end justify-end gap-2">
              <Button variant="destructive" size="sm" onClick={handleReattempt}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Re-attempt
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {attempt.answers.map((ans, index) => (
              <div
                key={index}
                className={`p-4 rounded border ${
                  ans.isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}
              >
                <p className="font-medium mb-2">
                  Q{index + 1}: {attempt.quiz.questions[index].question}
                </p>

                <p className="text-sm">
                  Your Answer: <strong>{ans.answer || "Not Answered"}</strong>
                </p>

                {!ans.isCorrect && (
                  <p className="text-sm text-green-700">
                    Correct Answer:{" "}
                    {
                      attempt.quiz.questions[index].options[
                        attempt.quiz.questions[index].correctAnswer
                      ]
                    }
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
