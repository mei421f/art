import { getDictionary, isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import FadeIn from "@/components/FadeIn";
import ContactForm from "@/components/ContactForm";

export default function ContactPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <FadeIn>
        <p className="text-sm text-muted">{dict.contact.label}</p>
        <h1 className="mt-4 font-display text-4xl md:text-5xl">{dict.contact.heading}</h1>
        <p className="mt-6 max-w-md text-muted">{dict.contact.sub}</p>
      </FadeIn>
      <ContactForm dict={dict} locale={locale} />
    </section>
  );
}
