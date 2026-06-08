import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "kk";
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as "signup" | "email" | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, url.origin));
    }
  }

  return NextResponse.redirect(new URL(`/${locale}/auth/sign-in?message=account_created`, url.origin));
}
