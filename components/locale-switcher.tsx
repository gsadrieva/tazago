import Link from "next/link";

import { getLocaleLabel } from "@/lib/locale";
import type { Locale } from "@/types/app";

type LocaleSwitcherProps = {
  currentLocale: Locale;
  pathname: string;
};

export function LocaleSwitcher({ currentLocale, pathname }: LocaleSwitcherProps) {
  return (
    <div className="inline-flex rounded-full border border-white/60 bg-white/80 p-1 shadow-[var(--shadow-cloud)]">
      {(["kk", "ru"] as const).map((locale) => {
        const href = pathname.replace(`/${currentLocale}`, `/${locale}`);
        const active = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={href}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-bold transition",
              active
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]",
            ].join(" ")}
          >
            {getLocaleLabel(locale)}
          </Link>
        );
      })}
    </div>
  );
}
