import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { getSessionContext } from "@/lib/auth";
import { signUpAction } from "@/lib/actions/auth";
import { getDictionary, getLocaleHref } from "@/lib/i18n";
import { resolveLocale } from "@/lib/locale";

export default async function SignUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dict = getDictionary(locale);
  const { user, profile } = await getSessionContext();
  const query = await searchParams;
  const nextPath = query.next?.startsWith("/") ? query.next : getLocaleHref(locale, "/dashboard");

  if (user) {
    redirect(nextPath);
  }

  const message =
    query.error === "user_exists"
      ? dict.auth.userExists
      : query.error === "signup_failed"
        ? dict.auth.signUpFailed
        : null;
  return (
    <SiteShell locale={locale} pathname={getLocaleHref(locale, "/auth/sign-up")} isAuthenticated={false} role={profile?.role}>
      <main className="section-shell py-16">
        <div className="mx-auto max-w-xl surface-card p-8">
          <h1 className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight">
            {dict.auth.signUpTitle}
          </h1>
          <p className="mt-4 text-[var(--color-on-surface-variant)]">{dict.auth.signUpSubtitle}</p>
          {message ? <p className="mt-5 rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-sm">{message}</p> : null}

          <form action={signUpAction} className="mt-8 grid gap-5">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="next" value={nextPath} />
            <label className="field-block">
              <span>{dict.auth.fullName}</span>
              <input name="fullName" required />
            </label>
            <label className="field-block">
              <span>{dict.auth.phone}</span>
              <input name="phone" required />
            </label>
            <label className="field-block">
              <span>{dict.auth.email}</span>
              <input type="email" name="email" required />
            </label>
            <label className="field-block">
              <span>{dict.auth.password}</span>
              <input type="password" name="password" minLength={6} required />
            </label>
            <button type="submit" className="btn btn-primary w-full">
              {dict.auth.signUpSubmit}
            </button>
          </form>

          <p className="mt-6 text-sm text-[var(--color-on-surface-variant)]">
            {dict.auth.hasAccount}{" "}
            <Link
              href={`${getLocaleHref(locale, "/auth/sign-in")}?next=${encodeURIComponent(nextPath)}`}
              className="font-bold text-[var(--color-primary)]"
            >
              {dict.auth.signIn}
            </Link>
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
