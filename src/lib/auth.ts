import { cookies } from "next/headers";
import { supabaseServer } from "./supabase-server";

const ACCESS_TOKEN_COOKIE = "sb-access-token";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";

export async function getSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;
  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser(accessToken);
  if (error || !user) return null;
  return { user };
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === "production";
  return [
    {
      name: ACCESS_TOKEN_COOKIE,
      value: accessToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    {
      name: REFRESH_TOKEN_COOKIE,
      value: refreshToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  ];
}

export function clearAuthCookies() {
  return [
    { name: ACCESS_TOKEN_COOKIE, value: "", path: "/", maxAge: 0 },
    { name: REFRESH_TOKEN_COOKIE, value: "", path: "/", maxAge: 0 },
  ];
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
