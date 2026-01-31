"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  async function submit() {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    alert("If email exists, reset link sent");
  }

  return (
    <div className="mt-20 w-full flex flex-col items-center gap-4 text-center max-w-sm mx-auto px-4 md:px-0 md:w-1/3 md:min-w-[400px]">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button onClick={submit}>Reset</Button>
    </div>
  );
}
