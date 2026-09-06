import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import FadeIn from "@/components/FadeIn";

export default function AboutPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <FadeIn>
        <p className="text-sm text-muted">{dict.about.label}</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">{dict.about.heading}</h1>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted">{dict.about.body}</p>
      </FadeIn>
      <div className="mt-16 border-t border-line pt-10">
        <p className="text-sm text-muted">{dict.about.toolsLabel}</p>
        <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
          {dict.about.tools.map((tool) => (
            <li key={tool} className="font-display text-lg">
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
