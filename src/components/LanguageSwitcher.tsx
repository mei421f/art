"use client";

import { usePathname, useRouter } from "next/navigation";
import { otherLocale, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const target = otherLocale(locale);

  function switchLocale() {
    const rest = pathname.replace(`/${locale}`, "") || "";
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000`;
    router.push(`/${target}${rest}`);
  }

  return (
    <button
      onClick={switchLocale}
      className="text-sm tracking-wide text-muted transition-colors hover:text-fg"
      aria-label="Switch language"
    >
      {target === "fa" ? "FA" : "EN"}
    </button>
  );
}
