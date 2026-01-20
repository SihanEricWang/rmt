// lib/actions.ts (createReview)
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase";

const ALLOWED_DOMAIN = "@basischina.com";

function clean(s: FormDataEntryValue | null) {
  return String(s ?? "").trim();
}

function parseIntSafe(v: string) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export async function createReview(formData: FormData) {
  const teacherId = clean(formData.get("teacherId"));

  const quality = parseIntSafe(clean(formData.get("quality")));
  const difficulty = parseIntSafe(clean(formData.get("difficulty")));

  const wouldTakeAgainRaw = clean(formData.get("wouldTakeAgain")).toLowerCase();
  const would_take_again = wouldTakeAgainRaw === "yes";

  const course = clean(formData.get("course")); // course code
  const grade = clean(formData.get("grade"));
  const isOnline = clean(formData.get("isOnline")) === "1";

  const requireCourse = clean(formData.get("requireCourse")) === "1";
  const requireComment = clean(formData.get("requireComment")) === "1";
  const maxTags = Math.min(10, Math.max(0, Number(clean(formData.get("maxTags")) || 10)));
  const commentLimit = Math.min(1200, Math.max(50, Number(clean(formData.get("commentLimit")) || 1200)));

  const comment = clean(formData.get("comment"));

  const tagsRaw = clean(formData.get("tags"));
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, maxTags)
        .map((t) => t.toUpperCase())
    : [];

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const user = userData.user;
  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Please sign in to post a review.")}`);
  }
  if (user.email && !user.email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
    redirect(`/login?error=${encodeURIComponent("Only internal emails are allowed.")}`);
  }

  if (!teacherId) redirect(`/teachers?error=${encodeURIComponent("Missing teacher id.")}`);
  if (!quality || quality < 1 || quality > 5)
    redirect(`/professor/${teacherId}?error=${encodeURIComponent("Invalid quality.")}`);
  if (!difficulty || difficulty < 1 || difficulty > 5)
    redirect(`/professor/${teacherId}?error=${encodeURIComponent("Invalid difficulty.")}`);

  if (requireCourse && !course) {
    redirect(`/professor/${teacherId}/rate?error=${encodeURIComponent("Course code is required.")}`);
  }

  if (requireComment && !comment) {
    redirect(`/professor/${teacherId}/rate?error=${encodeURIComponent("Review text is required.")}`);
  }

  if (comment.length > commentLimit) {
    redirect(
      `/professor/${teacherId}/rate?error=${encodeURIComponent(
        `Review is too long (max ${commentLimit} characters).`
      )}`
    );
  }

  const { error } = await supabase.from("reviews").insert({
    teacher_id: teacherId,
    user_id: user.id,
    quality,
    difficulty,
    would_take_again,
    comment: comment || null,
    tags,
    course: course || null,
    grade: grade || null,
    is_online: isOnline,
  });

  if (error) {
    redirect(`/professor/${teacherId}/rate?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/professor/${teacherId}`);
  redirect(`/professor/${teacherId}#ratings`);
}



// lib/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase";

const ALLOWED_DOMAIN = "@basischina.com";

function clean(s: FormDataEntryValue | null) {
  return String(s ?? "").trim();
}

function parseIntSafe(v: string) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export async function createReview(formData: FormData) {
  const teacherId = clean(formData.get("teacherId"));
  const quality = parseIntSafe(clean(formData.get("quality")));
  const difficulty = parseIntSafe(clean(formData.get("difficulty")));
  const wouldTakeAgainRaw = clean(formData.get("wouldTakeAgain")).toLowerCase();
  const comment = clean(formData.get("comment"));
  const course = clean(formData.get("course"));

  const tagsRaw = clean(formData.get("tags"));
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10)
        .map((t) => t.toUpperCase())
    : [];

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const user = userData.user;
  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Please sign in to post a review.")}`);
  }
  if (user.email && !user.email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
    redirect(`/login?error=${encodeURIComponent("Only internal emails are allowed.")}`);
  }

  if (!teacherId) redirect(`/teachers?error=${encodeURIComponent("Missing teacher id.")}`);
  if (!quality || quality < 1 || quality > 5) redirect(`/professor/${teacherId}?error=${encodeURIComponent("Invalid quality.")}`);
  if (!difficulty || difficulty < 1 || difficulty > 5) redirect(`/professor/${teacherId}?error=${encodeURIComponent("Invalid difficulty.")}`);

  const would_take_again = wouldTakeAgainRaw === "yes";

  if (comment.length > 1200) {
    redirect(`/professor/${teacherId}?error=${encodeURIComponent("Comment is too long (max 1200).")}`);
  }

  const { error } = await supabase.from("reviews").insert({
    teacher_id: teacherId,
    user_id: user.id,
    quality,
    difficulty,
    would_take_again,
    comment: comment || null,
    tags,
    course: course || null,
  });

  if (error) {
    redirect(`/professor/${teacherId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/professor/${teacherId}`);
  redirect(`/professor/${teacherId}#ratings`);
}
