import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import FadeIn from "@/components/FadeIn";
import ProjectRow, { type ProjectViewModel } from "@/components/ProjectRow";

export const revalidate = 3600;

export default async function WorkPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);

  let projects: ProjectViewModel[] = [];
  try {
    const rows = await prisma.project.findMany({
      where: { published: true },
      orderBy: { order: "asc" }
    });
    projects = rows.map((p) => ({
      slug: p.slug,
      title: locale === "fa" ? p.titleFa : p.titleEn,
      tagline: locale === "fa" ? p.taglineFa : p.taglineEn,
      category: p.category,
      year: p.year
    }));
  } catch {
    projects = [];
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <FadeIn>
        <p className="text-sm text-muted">{dict.work.label}</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">{dict.work.heading}</h1>
      </FadeIn>
      <div className="mt-16">
        {projects.length > 0 ? (
          projects.map((project) => <ProjectRow key={project.slug} project={project} />)
        ) : (
          <p className="text-sm text-muted">{dict.work.empty}</p>
        )}
      </div>
    </section>
  );
}
