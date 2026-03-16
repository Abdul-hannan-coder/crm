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
  if (!error && user) return { user };

  // Access token expired — attempt refresh using the refresh token cookie
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) return null;

  const { data: refreshData, error: refreshError } =
    await supabaseServer.auth.refreshSession({ refresh_token: refreshToken });
  if (refreshError || !refreshData.session) return null;

  // Persist the new tokens — cookieStore.set() is available in Route Handler context
  const newCookieOpts = setAuthCookies(
    refreshData.session.access_token,
    refreshData.session.refresh_token ?? ""
  );
  newCookieOpts.forEach((c) => {
    cookieStore.set(c.name, c.value, {
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite,
      path: c.path,
      maxAge: c.maxAge,
    });
  });

  return { user: refreshData.session.user };
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
