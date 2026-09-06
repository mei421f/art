import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import FadeIn from "@/components/FadeIn";

export default function ServicesPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <FadeIn>
        <p className="text-sm text-muted">{dict.services.label}</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">{dict.services.heading}</h1>
      </FadeIn>
      <div className="mt-16">
        {dict.services.items.map((item) => (
          <div
            key={item.title}
            className="grid grid-cols-1 gap-2 border-b border-line py-10 md:grid-cols-[1fr_2fr] md:gap-12"
          >
            <h2 className="font-display text-2xl md:text-3xl">{item.title}</h2>
            <p className="max-w-prose text-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
