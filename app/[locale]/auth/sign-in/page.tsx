import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { getSessionContext } from "@/lib/auth";
import { signInAction } from "@/lib/actions/auth";
import { getDictionary, getLocaleHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const { user, profile } = await getSessionContext();
  const query = await searchParams;

  if (user) {
    redirect(getLocaleHref(locale, "/dashboard"));
  }

  const message =
    query.message === "account_created"
      ? dict.auth.accountCreated
      : query.message === "email_confirmation_required"
        ? dict.auth.emailConfirmationRequired
      : query.error === "invalid_credentials"
        ? dict.auth.invalidCredentials
        : query.error === "email_not_confirmed"
          ? dict.auth.emailNotConfirmed
          : query.error === "signin_failed"
            ? dict.auth.signInFailed
        : null;
  const nextPath = query.next?.startsWith("/") ? query.next : getLocaleHref(locale, "/dashboard");

  return (
    <SiteShell locale={locale} pathname={getLocaleHref(locale, "/auth/sign-in")} isAuthenticated={false} role={profile?.role}>
      <main className="section-shell py-16">
        <div className="mx-auto max-w-xl surface-card p-8">
          <h1 className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight">
            {dict.auth.signInTitle}
          </h1>
          <p className="mt-4 text-[var(--color-on-surface-variant)]">{dict.auth.signInSubtitle}</p>
          {message ? <p className="mt-5 rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm">{message}</p> : null}

          <form action={signInAction} className="mt-8 grid gap-5">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="next" value={nextPath} />
            <label className="field-block">
              <span>{dict.auth.email}</span>
              <input type="email" name="email" required />
            </label>
            <label className="field-block">
              <span>{dict.auth.password}</span>
              <input type="password" name="password" required />
            </label>
            <button type="submit" className="btn btn-primary w-full">
              {dict.auth.signInSubmit}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--color-on-surface-variant)]">
            {dict.auth.noAccount}{" "}
            <Link href={getLocaleHref(locale, "/auth/sign-up")} className="font-bold text-[var(--color-primary)]">
              {dict.auth.signUp}
            </Link>
          </p>
          <p className="mt-3 text-sm text-[var(--color-on-surface-variant)]">
            <Link href={getLocaleHref(locale, "/admin/login")} className="font-bold text-[var(--color-primary)]">
              {locale === "kk" ? "Админ кіруі" : "Вход в админку"}
            </Link>
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
