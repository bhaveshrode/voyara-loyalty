"use server";

import { redirect } from "next/navigation";
import { readDb } from "@/lib/db";
import type { UserRecord } from "@/lib/types";
import {
  clearSessionCookie,
  homeForRole,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export interface LoginState {
  error?: string;
}

interface AuthResult {
  user?: UserRecord;
  error?: string;
}

function authenticate(email: string, password: string): AuthResult {
  const database = readDb();
  const user = database.users.find((entry) => entry.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "We couldn't match those details. Try a demo account below." };
  }
  if (user.status !== "active") {
    return { error: "This membership is currently paused. Contact the Voyara team." };
  }
  return { user };
}

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password to continue." };
  }

  const result = authenticate(email, password);
  if (!result.user) return result;

  await setSessionCookie(result.user.id);
  redirect(homeForRole(result.user.role));
}

export async function demoLoginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const result = authenticate(email, "voyara123");
  if (!result.user) redirect("/login?error=demo");
  await setSessionCookie(result.user.id);
  redirect(homeForRole(result.user.role));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
