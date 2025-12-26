"use client";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Plus,
  Clock,
  Users,
  FileQuestion,
  Play,
  Edit,
  Trash2,
  BarChart,
} from "lucide-react";
import { toast } from "sonner";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function QuizzesContent() {
  const { data: quizzes, isLoading, mutate } = useSWR("/api/quizzes", fetcher);

  console.log("quizzes:", quizzes);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const response = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete quiz");
      toast.success("Quiz deleted successfully");
      mutate();
    } catch (error) {
      toast.error("Failed to delete quiz");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: "secondary",
      active: "default",
      completed: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quizzes"
        description="Create and manage quizzes for students"
      >
        <Button asChild>
          <Link href="/quizzes/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Link>
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{quizzes?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Quizzes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {quizzes?.filter((q) => q.status === "active").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Active Quizzes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {quizzes?.reduce((sum, q) => sum + (q.attempts || 0), 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes Grid */}
      {!quizzes?.length ? (
        <EmptyState
          icon={FileQuestion}
          title="No quizzes created"
          description="Create your first quiz to get started"
          action={
            <Button asChild>
              <Link href="/quizzes/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes?.map((quiz) => (
            <Card key={quiz._id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {quiz.description || "No description"}
                    </CardDescription>
                  </div>
                  {getStatusBadge(quiz.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileQuestion className="h-4 w-4" />
                    <span>{quiz.questions?.length || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.duration || 30} Minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Class {quiz.class}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/quizzes/${quiz._id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(quiz._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/quizzes/${quiz._id}/results`}>
                      <BarChart className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/quizzes/${quiz._id}/take`}>
                    <Play className="h-4 w-4 mr-2" />
                    Take Quiz
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
