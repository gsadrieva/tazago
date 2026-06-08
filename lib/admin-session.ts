import { createHash } from "node:crypto";

import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "tazago_admin_session";

function getAdminCredentials() {
  const login = process.env.ADMIN_LOGIN?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  return {
    login,
    password,
    secret,
    configured: Boolean(login && password && secret),
  };
}

function getAdminSessionToken() {
  const { login, password, secret, configured } = getAdminCredentials();

  if (!configured) {
    return null;
  }

  return createHash("sha256").update(`${login}:${password}:${secret}`).digest("hex");
}

export function isAdminCredentialsConfigured() {
  return getAdminCredentials().configured;
}

export function isValidAdminCredentials(login: string, password: string) {
  const credentials = getAdminCredentials();

  if (!credentials.configured) {
    return false;
  }

  return login === credentials.login && password === credentials.password;
}

export async function isAdminSessionActive() {
  const token = getAdminSessionToken();

  if (!token) {
    return false;
  }

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === token;
}

export async function createAdminSession() {
  const token = getAdminSessionToken();

  if (!token) {
    throw new Error("Admin credentials are not configured.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
