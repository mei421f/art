import { prisma } from "@/lib/prisma";
import ProjectsManager from "./ProjectsManager";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-semibold">Projects</h1>
      <p className="mt-2 text-sm text-muted">
        Shown on the public Work page, in order, when published.
      </p>
      <ProjectsManager
        initialProjects={projects.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString()
        }))}
      />
    </div>
  );
}
