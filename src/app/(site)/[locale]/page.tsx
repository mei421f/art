import Link from "next/link";
import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import FadeIn from "@/components/FadeIn";
import ProjectRow, { type ProjectViewModel } from "@/components/ProjectRow";

export const revalidate = 3600;

export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);

  let projects: ProjectViewModel[] = [];
  try {
    const rows = await prisma.project.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      take: 2
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
    <>
      {/* Hero — the one orchestrated moment on this page */}
      <section className="mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-6 py-24">
        <p
          className="text-sm text-muted opacity-0 animate-[fadeIn_0.8s_ease_forwards]"
          style={{ animationDelay: "0.1s" }}
        >
          {dict.hero.eyebrow}
        </p>
        <h1
          className="mt-6 max-w-4xl font-display text-4xl leading-[1.15] opacity-0 animate-[fadeIn_0.8s_ease_forwards] sm:text-6xl md:text-7xl"
          style={{ animationDelay: "0.25s" }}
        >
          {dict.hero.headline}
        </h1>
        <p
          className="mt-8 max-w-md text-base leading-relaxed text-muted opacity-0 animate-[fadeIn_0.8s_ease_forwards] md:max-w-lg md:text-lg"
          style={{ animationDelay: "0.45s" }}
        >
          {dict.hero.sub}
        </p>
        <div
          className="mt-10 flex flex-wrap items-center gap-6 opacity-0 animate-[fadeIn_0.8s_ease_forwards]"
          style={{ animationDelay: "0.6s" }}
        >
          <Link
            href={`/${locale}/work`}
            className="rounded-full bg-fg px-6 py-3 text-sm text-bg transition-opacity hover:opacity-80"
          >
            {dict.hero.cta}
          </Link>
          <Link href={`/${locale}/contact`} className="text-sm text-muted hover:text-fg">
            {dict.hero.ctaSecondary}
          </Link>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-6xl border-t border-line px-6 py-24">
        <FadeIn className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
          <p className="text-sm text-muted">{dict.intro.label}</p>
          <p className="max-w-2xl font-display text-2xl leading-relaxed md:text-3xl">
            {dict.intro.body}
          </p>
        </FadeIn>
      </section>

      {/* Selected work preview */}
      <section className="mx-auto max-w-6xl border-t border-line px-6 py-24">
        <FadeIn className="mb-10 flex items-baseline justify-between">
          <h2 className="font-display text-2xl md:text-3xl">{dict.work.heading}</h2>
          <Link href={`/${locale}/work`} className="text-sm text-muted hover:text-fg">
            {dict.nav.work}
          </Link>
        </FadeIn>
        <div>
          {projects.length > 0 ? (
            projects.map((project) => <ProjectRow key={project.slug} project={project} />)
          ) : (
            <p className="text-sm text-muted">{dict.work.empty}</p>
          )}
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-6xl border-t border-line px-6 py-24">
        <FadeIn className="mb-10">
          <h2 className="font-display text-2xl md:text-3xl">{dict.services.heading}</h2>
        </FadeIn>
        <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
          {dict.services.items.map((item) => (
            <div key={item.title} className="border-b border-line py-6">
              <h3 className="font-display text-xl">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
