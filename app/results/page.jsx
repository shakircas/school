"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";

import { ResultsFiltersBar } from "@/components/results/results-filters-bar";
import { ResultsTable } from "@/components/results/results-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ResultsPage() {
  /* ---------------- STATE ---------------- */
  const [filters, setFilters] = useState({
    examId: "",
    classId: "",
    sectionId: "",
    student: "",
  });

  /* ---------------- QUERY BUILD ---------------- */
  const resultsUrl = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    return `/api/results?${params.toString()}`;
  }, [filters]);

  /* ---------------- API ---------------- */
  const { data: results = [], mutate } = useSWR(resultsUrl, fetcher);
  const { data: examsRes } = useSWR("/api/exams", fetcher);
  const { data: classesRes } = useSWR("/api/academics/classes", fetcher);

  const exams = examsRes?.data || [];
  const classes = classesRes?.data || [];

  /* ---------------- ACTIONS ---------------- */
  const handleDelete = async (id) => {
    if (!confirm("Delete this result?")) return;

    const res = await fetch("/api/results", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      toast.success("Result deleted");
      mutate();
    } else {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (result) => {
    toast.info("Edit modal can open here");
    // You can open your Add/Edit Result dialog here
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Exam Results</h1>
          <p className="text-muted-foreground">
            Filter, view, and manage exam results
          </p>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Result
        </Button>
      </div>

      {/* FILTER BAR */}
      <ResultsFiltersBar
        exams={exams}
        classes={classes}
        filters={filters}
        setFilters={setFilters}
      />

      {/* RESULTS TABLE */}
      <ResultsTable
        results={results}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
