"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/lib/dictionaries/fa";
import type { Locale } from "@/lib/i18n";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [status, setStatus] = useState<Status>("idle");
  const f = dict.contact.form;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      budget: String(form.get("budget") || ""),
      message: String(form.get("message") || ""),
      locale
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 flex max-w-xl flex-col gap-6">
      <Field label={f.name} name="name" required />
      <Field label={f.email} name="email" type="email" required />
      <Field label={f.budget} name="budget" />
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm text-muted">
          {f.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="border-b border-line bg-transparent py-2 outline-none transition-colors focus:border-fg"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 w-fit rounded-full border border-line px-6 py-3 text-sm transition-colors hover:border-fg disabled:opacity-50"
      >
        {status === "sending" ? f.sending : f.submit}
      </button>
      {status === "success" && <p className="text-sm text-muted">{f.success}</p>}
      {status === "error" && <p className="text-sm text-muted">{f.error}</p>}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="border-b border-line bg-transparent py-2 outline-none transition-colors focus:border-fg"
      />
    </div>
  );
}
