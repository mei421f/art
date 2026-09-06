import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries/fa";
import type { Locale } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

const links: { key: keyof Dictionary["nav"]; href: string }[] = [
  { key: "work", href: "/work" },
  { key: "services", href: "/services" },
  { key: "about", href: "/about" },
  { key: "process", href: "/process" },
  { key: "contact", href: "/contact" }
];

export default function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href={`/${locale}`} className="font-display text-lg tracking-tightest">
          Artosphere
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.key}
              href={`/${locale}${link.href}`}
              className="text-sm text-muted transition-colors hover:text-fg"
            >
              {dict.nav[link.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher locale={locale} />
          <Link
            href={`/${locale}/contact`}
            className="hidden rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-fg md:inline-block"
          >
            {dict.hero.ctaSecondary}
          </Link>
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="flex items-center gap-5 overflow-x-auto border-t border-line px-6 py-3 md:hidden">
        {links.map((link) => (
          <Link
            key={link.key}
            href={`/${locale}${link.href}`}
            className="whitespace-nowrap text-sm text-muted hover:text-fg"
          >
            {dict.nav[link.key]}
          </Link>
        ))}
      </nav>
    </header>
  );
}
