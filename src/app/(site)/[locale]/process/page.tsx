import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import FadeIn from "@/components/FadeIn";

export default function ProcessPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <FadeIn>
        <p className="text-sm text-muted">{dict.process.label}</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">{dict.process.heading}</h1>
      </FadeIn>
      <ol className="mt-16">
        {dict.process.steps.map((step, index) => (
          <li
            key={step.title}
            className="grid grid-cols-[3rem_1fr] gap-6 border-b border-line py-10 md:grid-cols-[5rem_1fr_2fr]"
          >
            <span className="font-display text-2xl text-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="font-display text-2xl md:text-3xl">{step.title}</h2>
            <p className="max-w-prose text-muted md:col-start-3">{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
