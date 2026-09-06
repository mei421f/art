import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Inter, Space_Grotesk, Vazirmatn } from "next/font/google";
import "../../globals.css";
import { getDictionary, isLocale, locales, defaultLocale, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Latin faces (used for the English site: a display face paired with a body face)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display-en"
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body-en"
});
// Persian face — one family, used for both headings and body via weight only,
// since Space Grotesk/Inter have no Arabic-script glyphs.
const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-fa"
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    metadataBase: new URL("https://artospherebranding.ir")
  };
}

export default function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dir = locale === "fa" ? "rtl" : "ltr";
  const dict = getDictionary(locale);

  // Map the generic font-display / font-body utilities used throughout the
  // components to the right underlying family for the active locale, so no
  // page or component needs to branch on locale just to pick a typeface.
  const fontMap =
    locale === "fa"
      ? ({ "--font-display": "var(--font-fa)", "--font-body": "var(--font-fa)" } as CSSProperties)
      : ({
          "--font-display": "var(--font-display-en)",
          "--font-body": "var(--font-body-en)"
        } as CSSProperties);

  return (
    <html lang={locale} dir={dir}>
      <body
        style={fontMap}
        className={`${spaceGrotesk.variable} ${inter.variable} ${vazirmatn.variable} font-body bg-bg text-fg antialiased`}
      >
        <Header locale={locale} dict={dict} />
        <main>{children}</main>
        <Footer locale={locale} dict={dict} />
      </body>
    </html>
  );
}
