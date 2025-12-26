"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function TakeQuizContent({ quizId }) {
  const router = useRouter();
  const { data: quizData, isLoading } = useSWR(
    `/api/quizzes/${quizId}`,
    fetcher
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  console.log(quizData?.data);
  const quiz = quizData?.data;

  useEffect(() => {
    if (quiz?.duration) {
      setTimeLeft(quiz.duration * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: Number.parseInt(value),
    }));
  };

  const handleSubmit = async () => {
    try {
      // Calculate results
      let correct = 0;
      quiz.questions.forEach((q, index) => {
        if (answers[index] == q.correctAnswer) {
          correct++;
        }
      });

      const score = ((correct / quiz.questions.length) * 100).toFixed(1);

      setResults({
        correct,
        total: quiz.questions.length,
        score,
        answers,
      });
      setSubmitted(true);

      // Save attempt
      await fetch("/api/quizzes/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz: quizId,
          answers,
          score,
          correct,
          total: quiz.questions.length,
        }),
      });

      toast.success("Quiz submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit quiz");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Quiz not found</p>
      </div>
    );
  }

  if (submitted && results) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quiz Results" description={quiz.title} />

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {Number.parseFloat(results.score) >= 50 ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-3xl">{results.score}%</CardTitle>
            <CardDescription>
              You got {results.correct} out of {results.total} questions correct
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quiz.questions.map((q, index) => {
                const userAnswer = results.answers[index];
                const isCorrect = userAnswer == q.correctAnswer;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isCorrect
                        ? "bg-green-50 dark:bg-green-950 border-green-200"
                        : "bg-red-50 dark:bg-red-950 border-red-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">
                        {index + 1}. {q.question}
                      </p>
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                      )}
                    </div>
                    <div className="mt-2 text-sm">
                      <p>
                        Your answer:{" "}
                        <span
                          className={
                            isCorrect ? "text-green-600" : "text-red-600"
                          }
                        >
                          {q.options[userAnswer] || "Not answered"}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-green-600">
                          Correct answer: {q.options[q.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push("/quizzes")}>
              Back to Quizzes
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quiz?.questions.length) * 100;
  const question = quiz.questions[currentQuestion];

  return (
    <div className="space-y-6">
      <PageHeader title={quiz.title} description={quiz.description}>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span
            className={`font-mono text-lg ${
              timeLeft < 60 ? "text-red-500" : ""
            }`}
          >
            {formatTime(timeLeft || 0)}
          </span>
        </div>
      </PageHeader>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </Badge>
            <Badge>{quiz.subject}</Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-6">
            <h3 className="text-xl font-medium">{question.question}</h3>

            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    answers[currentQuestion] == index
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleAnswer(index.toString())}
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    <span className="font-semibold mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion == 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentQuestion((prev) =>
                  Math.min(quiz.questions.length - 1, prev + 1)
                )
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Question Navigator */}
      <Card className="max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-3">
            Question Navigator
          </p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, index) => (
              <Button
                key={index}
                variant={
                  currentQuestion == index
                    ? "default"
                    : answers[index] !== undefined
                    ? "secondary"
                    : "outline"
                }
                size="sm"
                className="w-10 h-10"
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
