"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  isAdminCredentialsConfigured,
  isValidAdminCredentials,
} from "@/lib/admin-session";
import { resolveLocale } from "@/lib/locale";

function normalizeField(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function adminSignInAction(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  const login = normalizeField(formData.get("login"));
  const password = normalizeField(formData.get("password"));

  if (!isAdminCredentialsConfigured()) {
    redirect(`/${locale}/admin/login?error=not_configured`);
  }

  if (!isValidAdminCredentials(login, password)) {
    redirect(`/${locale}/admin/login?error=invalid_credentials`);
  }

  await createAdminSession();
  redirect(`/${locale}/admin`);
}

export async function adminSignOutAction(formData: FormData) {
  const locale = resolveLocale(formData.get("locale"));
  await clearAdminSession();
  redirect(`/${locale}/admin/login?signed_out=1`);
}
