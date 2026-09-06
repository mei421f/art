import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries/fa";
import type { Locale } from "@/lib/i18n";

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <p className="max-w-md font-display text-xl leading-relaxed">{dict.footer.tagline}</p>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <span>
            © {year} Artosphere — {dict.footer.rights}
          </span>
          <Link href={`/${locale}/contact`} className="hover:text-fg">
            {dict.nav.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}
