"use client";
import { useState } from "react";

export default function Reset({ params }) {
  const [password, setPassword] = useState("");

  async function submit() {
    await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: params.token,
        password,
      }),
    });
    alert("Password updated");
  }

  return (
    <div>
      <input type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={submit}>Save</button>
    </div>
  );
}
