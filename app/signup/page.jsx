"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    class: "",
  });

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      toast.success("Account created. Please login.");
      router.push("/login");
    } catch {
      toast.error("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Student Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Full Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Input
            placeholder="Roll Number"
            onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
          />
          <Input
            placeholder="Class (e.g. 9)"
            onChange={(e) => setForm({ ...form, class: e.target.value })}
          />

          <Button className="w-full" onClick={submit} disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
