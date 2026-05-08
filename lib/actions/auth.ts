"use server";

import { redirect } from "next/navigation";

import { resolveLocale } from "@/lib/locale";
import { createClient } from "@/lib/supabase/server";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeField(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function getAuthErrorCode(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "email_not_confirmed";
  }

  if (normalized.includes("invalid login credentials") || normalized.includes("invalid_credentials")) {
    return "invalid_credentials";
  }

  if (normalized.includes("user already registered") || normalized.includes("already been registered")) {
    return "user_exists";
  }

  return "unknown";
}

function getSafeNext(nextValue: FormDataEntryValue | null, locale: string) {
  const value = typeof nextValue === "string" ? nextValue : "";
  if (!value.startsWith("/")) {
    return `/${locale}/dashboard`;
  }

  return value;
}

export async function signInAction(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const nextPath = getSafeNext(formData.get("next"), locale);
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const code = getAuthErrorCode(error.message);
    const queryError =
      code === "email_not_confirmed"
        ? "email_not_confirmed"
        : code === "invalid_credentials"
          ? "invalid_credentials"
          : "signin_failed";

    redirect(`/${locale}/auth/sign-in?error=${queryError}&next=${encodeURIComponent(nextPath)}`);
  }

  redirect(nextPath);
}

export async function signUpAction(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const nextPath = getSafeNext(formData.get("next"), locale);
  const fullName = normalizeField(formData.get("fullName"));
  const phone = normalizeField(formData.get("phone"));
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        preferred_locale: locale,
      },
    },
  });

  if (error) {
    const code = getAuthErrorCode(error.message);
    const queryError = code === "user_exists" ? "user_exists" : "signup_failed";

    redirect(`/${locale}/auth/sign-up?error=${queryError}&next=${encodeURIComponent(nextPath)}`);
  }

  if (data.session) {
    redirect(nextPath);
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError) {
    redirect(nextPath);
  }

  const signInCode = getAuthErrorCode(signInError.message);

  if (signInCode === "email_not_confirmed") {
    redirect(
      `/${locale}/auth/sign-in?message=email_confirmation_required&next=${encodeURIComponent(nextPath)}`
    );
  }

  redirect(`/${locale}/auth/sign-in?message=account_created&next=${encodeURIComponent(nextPath)}`);
}
