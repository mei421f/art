"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  slug: string;
  order: number;
  titleFa: string;
  titleEn: string;
  taglineFa: string;
  taglineEn: string;
  descriptionFa: string;
  descriptionEn: string;
  category: string;
  year: string;
  coverImage: string | null;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type FormValues = Omit<Project, "id">;

const emptyForm: FormValues = {
  slug: "",
  order: 0,
  titleFa: "",
  titleEn: "",
  taglineFa: "",
  taglineEn: "",
  descriptionFa: "",
  descriptionEn: "",
  category: "",
  year: new Date().getFullYear().toString(),
  coverImage: "",
  published: true
};

export default function ProjectsManager({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createProject(values: FormValues) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error === "slug_taken" ? "This slug is already used." : "Could not save the project.");
      return;
    }
    const { project } = await res.json();
    setProjects((prev) => [...prev, project].sort((a, b) => a.order - b.order));
    setShowAdd(false);
    router.refresh();
  }

  async function updateProject(id: string, values: FormValues) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error === "slug_taken" ? "This slug is already used." : "Could not save the project.");
      return;
    }
    const { project } = await res.json();
    setProjects((prev) => prev.map((p) => (p.id === id ? project : p)).sort((a, b) => a.order - b.order));
    setEditingId(null);
    router.refresh();
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project? This can't be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="mt-8">
      <button
        onClick={() => setShowAdd((v) => !v)}
        className="rounded-full border border-line px-5 py-2 text-sm hover:border-fg"
      >
        {showAdd ? "Cancel" : "+ Add project"}
      </button>

      {showAdd && (
        <div className="mt-6 border border-line p-6">
          <ProjectForm
            initial={emptyForm}
            busy={busy}
            submitLabel="Create project"
            onSubmit={createProject}
          />
        </div>
      )}

      {error && <p className="mt-4 text-sm text-muted">{error}</p>}

      <div className="mt-8 flex flex-col">
        {projects.map((project) => (
          <div key={project.id} className="border-t border-line py-6">
            {editingId === project.id ? (
              <div className="border border-line p-6">
                <ProjectForm
                  initial={project}
                  busy={busy}
                  submitLabel="Save changes"
                  onSubmit={(values) => updateProject(project.id, values)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{project.titleEn}</span>
                    <span className="text-xs text-muted">/{project.slug}</span>
                    {!project.published && (
                      <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {project.category} · {project.year} · order {project.order}
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <button onClick={() => setEditingId(project.id)} className="text-muted hover:text-fg">
                    Edit
                  </button>
                  <button onClick={() => deleteProject(project.id)} className="text-muted hover:text-fg">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectForm({
  initial,
  busy,
  submitLabel,
  onSubmit,
  onCancel
}: {
  initial: FormValues;
  busy: boolean;
  submitLabel: string;
  onSubmit: (values: FormValues) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<FormValues>(initial);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <TextField label="Slug" value={values.slug} onChange={(v) => set("slug", v)} required />
      <TextField
        label="Order"
        type="number"
        value={String(values.order)}
        onChange={(v) => set("order", Number(v) || 0)}
      />
      <TextField label="Title (FA)" value={values.titleFa} onChange={(v) => set("titleFa", v)} required />
      <TextField label="Title (EN)" value={values.titleEn} onChange={(v) => set("titleEn", v)} required />
      <TextField label="Tagline (FA)" value={values.taglineFa} onChange={(v) => set("taglineFa", v)} />
      <TextField label="Tagline (EN)" value={values.taglineEn} onChange={(v) => set("taglineEn", v)} />
      <TextAreaField
        label="Description (FA)"
        value={values.descriptionFa}
        onChange={(v) => set("descriptionFa", v)}
      />
      <TextAreaField
        label="Description (EN)"
        value={values.descriptionEn}
        onChange={(v) => set("descriptionEn", v)}
      />
      <TextField label="Category" value={values.category} onChange={(v) => set("category", v)} required />
      <TextField label="Year" value={values.year} onChange={(v) => set("year", v)} required />
      <TextField
        label="Cover image URL"
        value={values.coverImage || ""}
        onChange={(v) => set("coverImage", v)}
      />
      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) => set("published", e.target.checked)}
        />
        Published (visible on the public site)
      </label>

      <div className="col-span-full mt-2 flex gap-4">
        <button
          type="submit"
          disabled={busy}
          className="w-fit rounded-full border border-line px-6 py-2 text-sm hover:border-fg disabled:opacity-50"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-fg">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-muted">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="border-b border-line bg-transparent py-1 text-fg outline-none focus:border-fg"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-muted">
      {label}
      <textarea
        value={value}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className="border-b border-line bg-transparent py-1 text-fg outline-none focus:border-fg"
      />
    </label>
  );
}
