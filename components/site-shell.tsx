import Link from "next/link";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { adminSignOutAction } from "@/lib/actions/admin-auth";
import { isAdminSessionActive } from "@/lib/admin-session";
import { getDictionary, getLocaleHref } from "@/lib/i18n";
import type { Locale, UserRole } from "@/types/app";

type SiteShellProps = {
  children: React.ReactNode;
  locale: Locale;
  pathname: string;
  isAuthenticated: boolean;
  role?: UserRole | null;
};

export async function SiteShell({
  children,
  locale,
  pathname,
  isAuthenticated,
  role,
}: SiteShellProps) {
  const dict = getDictionary(locale);
  const adminSession = await isAdminSessionActive();
  const hasAdminAccess = role === "admin" || adminSession;
  const links = [
    { href: getLocaleHref(locale), label: dict.nav.home },
    { href: getLocaleHref(locale, "/services"), label: dict.nav.services },
    { href: getLocaleHref(locale, "/booking"), label: dict.nav.booking },
    { href: getLocaleHref(locale, "/contact"), label: dict.nav.contact },
    { href: getLocaleHref(locale, "/dashboard"), label: dict.nav.dashboard },
  ];

  if (hasAdminAccess) {
    links.push({ href: getLocaleHref(locale, "/admin"), label: dict.nav.admin });
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)]">
      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/75 backdrop-blur-2xl">
        <div className="section-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Link href={getLocaleHref(locale)} prefetch={false} className="flex items-center gap-3">
            <img
              src="/tazago-logo-badge.svg"
              alt="TazaGo logo"
              className="h-11 w-11 rounded-full object-cover shadow-[0_20px_40px_rgba(79,98,107,0.12)]"
            />
            <div>
              <div className="font-[family-name:var(--font-manrope)] text-lg font-extrabold tracking-tight text-[var(--color-primary)]">
                {dict.brand.name}
              </div>
              <div className="text-xs text-[var(--color-on-surface-variant)]">{dict.brand.tagline}</div>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className={
                    active
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <LocaleSwitcher currentLocale={locale} pathname={pathname} />
            {adminSession ? (
              <form action={adminSignOutAction}>
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="btn btn-ghost">
                  {locale === "kk" ? "Админнен шығу" : "Выйти из админки"}
                </button>
              </form>
            ) : isAuthenticated ? (
              <Link href={`/auth/signout?locale=${locale}`} prefetch={false} className="btn btn-ghost">
                {dict.auth.signOut}
              </Link>
            ) : (
              <>
                <Link href={getLocaleHref(locale, "/auth/sign-in")} prefetch={false} className="btn btn-ghost">
                  {dict.auth.signIn}
                </Link>
                <Link href={getLocaleHref(locale, "/auth/sign-up")} prefetch={false} className="btn btn-primary">
                  {dict.auth.signUp}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-white/30 bg-white/70 py-8">
        <div className="section-shell flex flex-col gap-3 text-sm text-[var(--color-on-surface-variant)] md:flex-row md:items-center md:justify-between">
          <div>
            <span className="font-bold text-[var(--color-on-surface)]">{dict.brand.name}</span>{" "}
            {dict.footer.cityLine}
          </div>
          <div>{dict.footer.rights}</div>
        </div>
      </footer>
    </div>
  );
}
