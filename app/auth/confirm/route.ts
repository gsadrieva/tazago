import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "kk";

  return NextResponse.redirect(new URL(`/${locale}/auth/sign-in?message=account_created`, url.origin));
}
