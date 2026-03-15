"use client";

import { SmartRenderer } from "@/components/ai/SmartRenderer";
import { useState } from "react";

export default function AISchoolBrain() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI() {
    setLoading(true);

    const res = await fetch("/api/ai/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();

    setAnswer(data.answer);

    setLoading(false);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI School Brain</h1>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full border p-3 rounded"
        placeholder="Ask about attendance, results, teachers..."
      />

      <button
        onClick={askAI}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {answer && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="font-semibold mb-2">AI Answer</h2>
          {/* <p>{answer}</p> */}
          <SmartRenderer content={answer} />
        </div>
      )}
    </div>
  );
}
