import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "kk";

  return NextResponse.redirect(new URL(`/${locale}`, url.origin));
}
