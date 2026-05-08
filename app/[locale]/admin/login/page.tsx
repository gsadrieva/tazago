import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { getSessionContext } from "@/lib/auth";
import { adminSignInAction } from "@/lib/actions/admin-auth";
import { isAdminSessionActive } from "@/lib/admin-session";
import { getLocaleHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; signed_out?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const query = await searchParams;
  const { user, profile } = await getSessionContext();
  const adminSession = await isAdminSessionActive();

  if (adminSession || profile?.role === "admin") {
    redirect(`/${locale}/admin`);
  }

  const copy =
    locale === "kk"
      ? {
          title: "Админ кіруі",
          subtitle: "Админ панельге бөлек логин мен пароль арқылы кіресіз.",
          login: "Логин",
          password: "Құпиясөз",
          submit: "Админге кіру",
          back: "Басты бетке оралу",
          invalid: "Логин немесе пароль қате.",
          notConfigured: "Админ логині әлі бапталмаған.",
          signedOut: "Админ сессиясы жабылды.",
        }
      : {
          title: "Вход в админку",
          subtitle: "Используйте отдельный логин и пароль для доступа к админ-панели.",
          login: "Логин",
          password: "Пароль",
          submit: "Войти в админку",
          back: "Вернуться на главную",
          invalid: "Неверный логин или пароль.",
          notConfigured: "Админ-логин пока не настроен.",
          signedOut: "Сессия админа завершена.",
        };

  const message =
    query.error === "invalid_credentials"
      ? copy.invalid
      : query.error === "not_configured"
        ? copy.notConfigured
        : query.signed_out
          ? copy.signedOut
          : null;

  return (
    <SiteShell
      locale={locale}
      pathname={`/${locale}/admin/login`}
      isAuthenticated={Boolean(user)}
      role={profile?.role}
    >
      <main className="section-shell py-16">
        <div className="mx-auto max-w-xl surface-card p-8">
          <h1 className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight">
            {copy.title}
          </h1>
          <p className="mt-4 text-[var(--color-on-surface-variant)]">{copy.subtitle}</p>
          {message ? (
            <p className="mt-5 rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm">
              {message}
            </p>
          ) : null}

          <form action={adminSignInAction} className="mt-8 grid gap-5">
            <input type="hidden" name="locale" value={locale} />
            <label className="field-block">
              <span>{copy.login}</span>
              <input type="text" name="login" autoComplete="username" required />
            </label>
            <label className="field-block">
              <span>{copy.password}</span>
              <input type="password" name="password" autoComplete="current-password" required />
            </label>
            <button type="submit" className="btn btn-primary w-full">
              {copy.submit}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--color-on-surface-variant)]">
            <Link href={getLocaleHref(locale)} className="font-bold text-[var(--color-primary)]">
              {copy.back}
            </Link>
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
