import { api } from "./client";
import type { User } from "@/types";

export interface LoginBody {
  email: string;
  password: string;
}

export interface SignupBody {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string;
}

export function getSession() {
  return api.get<{ user: User | null }>("/api/auth/session");
}

export function login(body: LoginBody) {
  return api.post<{ user: User }>("/api/auth/login", body);
}

export function signup(body: SignupBody) {
  return api.post<{ user: User | null }>("/api/auth/signup", body);
}

export function logout() {
  return api.post<{ ok: boolean }>("/api/auth/logout", {});
}

export function getGoogleAuthUrl() {
  return api.get<{ url: string }>("/api/auth/google");
}

export function setSessionFromTokens(accessToken: string, refreshToken?: string) {
  return api.post<{ ok: boolean }>("/api/auth/set-session", {
    access_token: accessToken,
    refresh_token: refreshToken ?? "",
  });
}
