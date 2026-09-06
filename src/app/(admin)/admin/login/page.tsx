"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const form = new FormData(e.currentTarget);
    const token = String(form.get("token") || "");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="text-xl font-semibold">Admin login</h1>
      <p className="mt-2 text-sm text-muted">Enter the admin token to continue.</p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          type="password"
          name="token"
          autoFocus
          required
          placeholder="Admin token"
          className="border-b border-line bg-transparent py-2 outline-none focus:border-fg"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-fit rounded-full border border-line px-6 py-2 text-sm hover:border-fg disabled:opacity-50"
        >
          {loading ? "Checking…" : "Sign in"}
        </button>
        {error && <p className="text-sm text-muted">Invalid token.</p>}
      </form>
    </div>
  );
}
