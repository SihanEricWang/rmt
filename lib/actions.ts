// lib/actions.ts
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase";

const ALLOWED_DOMAIN = "@basischina.com";

function normalizeEmail(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim().toLowerCase();
}

function readString(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim();
}

function ensureAllowedEmail(email: string) {
  if (!email.endsWith(ALLOWED_DOMAIN)) {
    throw new Error(`Only internal email addresses (${ALLOWED_DOMAIN}) are allowed.`);
  }
}

export async function signInWithPassword(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = readString(formData.get("password"));
  const redirectTo = readString(formData.get("redirectTo")) || "/teachers";

  try {
    if (!email || !password) throw new Error("Please enter your email and password.");
    ensureAllowedEmail(email);

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw new Error(error.message);

    redirect(redirectTo);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sign in failed.";
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }
}

export async function signUpWithEmailAndPassword(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = readString(formData.get("password"));
  const confirmPassword = readString(formData.get("confirmPassword"));

  try {
    if (!email || !password) throw new Error("Please enter your email and password.");
    ensureAllowedEmail(email);

    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    if (password !== confirmPassword) throw new Error("Passwords do not match.");

    const supabase = createSupabaseServerClient();

    const origin = headers().get("origin") ?? "";
    const emailRedirectTo = `${origin}/auth/callback`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });

    if (error) throw new Error(error.message);

    redirect(
      `/login?message=${encodeURIComponent(
        "Account created. Please check your email to verify your address, then sign in."
      )}`
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sign up failed.";
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login?message=" + encodeURIComponent("You have been signed out."));
}
