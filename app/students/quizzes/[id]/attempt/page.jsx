"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QuizAttempt({ params }) {
  const { quizId } = params;
  const router = useRouter();
  const suspicious = tabSwitches > 3 || copyAttempts > 0 || fullscreenExit > 1;

  const QUIZ_TIME = 10 * 60; // 10 minutes

  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [fullscreenExit, setFullscreenExit] = useState(0);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* ================= ANTI-CHEAT ================= */

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setTabSwitches((v) => v + 1);
    };

    const handleCopy = () => setCopyAttempts((v) => v + 1);

    const handleFullscreen = () => {
      if (!document.fullscreenElement) setFullscreenExit((v) => v + 1);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("fullscreenchange", handleFullscreen);

    document.documentElement.requestFullscreen?.();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, []);

  /* ================= SUBMIT ================= */

  async function submitQuiz() {
    await fetch(`/api/quizzes/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({
        tabSwitches,
        copyAttempts,
        fullscreenExit,
        timeTaken: QUIZ_TIME - timeLeft,
      }),
    });

    router.push("/student/quizzes/result");
  }

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Quiz Attempt</h1>
        <span className="bg-red-600 px-3 py-1 rounded">
          ⏱ {Math.floor(timeLeft / 60)}:{timeLeft % 60}
        </span>
      </div>

      {/* Questions here */}

      <button
        onClick={submitQuiz}
        className="mt-6 bg-blue-600 px-6 py-2 rounded"
      >
        Submit Quiz
      </button>
    </div>
  );
}
