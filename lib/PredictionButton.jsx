"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { updatePrediction } from "./actions/prediction";

export default function PredictionButton({ studentId, predicted }) {
  let [isPending, startTransition] = useTransition();

  return (
    <Button
      onClick={() =>
        startTransition(() => updatePrediction(studentId, predicted))
      }
      disabled={isPending}
    >
      {isPending ? "Updating..." : "Update Prediction"}
    </Button>
  );
}
