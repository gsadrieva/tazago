import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionActive } from "@/lib/admin-session";
import { createClient } from "@/lib/supabase/server";
import type { AppProfile, Locale } from "@/types/app";

export async function getSessionContext() {
  noStore();

  const supabase = await createClient();
  let user = null;

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    console.warn("Supabase auth lookup failed", error);
    return { user: null, profile: null as AppProfile | null };
  }

  if (!user) {
    return { user: null, profile: null as AppProfile | null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, preferred_locale, city, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile
      ? ({
          id: profile.id,
          role: profile.role,
          fullName: profile.full_name,
          phone: profile.phone,
          preferredLocale: profile.preferred_locale,
          city: profile.city,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        } satisfies AppProfile)
      : null,
  };
}

export async function requireUser(locale: Locale, nextPath?: string) {
  const context = await getSessionContext();
  if (!context.user) {
    const next = encodeURIComponent(nextPath ?? `/${locale}/dashboard`);
    redirect(`/${locale}/auth/sign-in?next=${next}`);
  }

  return context;
}

export async function requireAdmin(locale: Locale) {
  if (await isAdminSessionActive()) {
    return {
      user: null,
      profile: null as AppProfile | null,
      adminSession: true,
    };
  }

  const context = await requireUser(locale, `/${locale}/admin`);
  if (context.profile?.role !== "admin") {
    redirect(`/${locale}/admin/login`);
  }

  return { ...context, adminSession: false };
}
