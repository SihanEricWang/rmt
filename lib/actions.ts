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

// lib/actions.ts (append)
"use server";

import { createSupabaseServerClient } from "./supabase";

const ALLOWED_DOMAIN = "@basischina.com";

function clean(s: FormDataEntryValue | null) {
  return String(s ?? "").trim();
}

export async function setReviewVote(formData: FormData) {
  const teacherId = clean(formData.get("teacherId"));
  const reviewId = clean(formData.get("reviewId"));
  const op = clean(formData.get("op")) as "up" | "down" | "clear";

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    // client will redirect via login link normally; keep it strict anyway
    throw new Error("Not authenticated");
  }
  if (user.email && !user.email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
    throw new Error("Only internal emails are allowed.");
  }

  if (!teacherId || !reviewId) throw new Error("Missing teacherId or reviewId.");

  if (op === "clear") {
    const { error } = await supabase
      .from("review_votes")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  }

  const vote = op === "up" ? 1 : -1;

  const { error } = await supabase.from("review_votes").upsert(
    {
      review_id: reviewId,
      user_id: user.id,
      vote,
    },
    { onConflict: "review_id,user_id" }
  );

  if (error) throw new Error(error.message);
  return { ok: true };
}
// lib/actions.ts (append)
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase";

export async function updateMyReview(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect(`/login?redirectTo=${encodeURIComponent("/me/ratings")}`);

  // internal email only
  if (user.email && !user.email.toLowerCase().endsWith("@basischina.com")) {
    redirect(`/me/ratings?error=${encodeURIComponent("Only internal emails are allowed.")}`);
  }

  const reviewId = String(formData.get("reviewId") ?? "").trim();
  if (!reviewId) redirect(`/me/ratings?error=${encodeURIComponent("Missing review id.")}`);

  const teacherId = String(formData.get("teacherId") ?? "").trim(); // for revalidate/redirect safety
  const quality = Number(String(formData.get("quality") ?? "0"));
  const difficulty = Number(String(formData.get("difficulty") ?? "0"));
  const wouldTakeAgain = String(formData.get("wouldTakeAgain") ?? "").trim().toLowerCase();
  const course = String(formData.get("course") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const isOnline = String(formData.get("isOnline") ?? "").trim() === "1";

  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10)
        .map((t) => t.toUpperCase())
    : [];

  const comment = String(formData.get("comment") ?? "").trim();

  // validations
  if (!Number.isFinite(quality) || quality < 1 || quality > 5) {
    redirect(`/me/ratings/${reviewId}/edit?error=${encodeURIComponent("Quality must be 1-5.")}`);
  }
  if (!Number.isFinite(difficulty) || difficulty < 1 || difficulty > 5) {
    redirect(`/me/ratings/${reviewId}/edit?error=${encodeURIComponent("Difficulty must be 1-5.")}`);
  }
  if (wouldTakeAgain !== "yes" && wouldTakeAgain !== "no") {
    redirect(`/me/ratings/${reviewId}/edit?error=${encodeURIComponent("Would take again is required.")}`);
  }
  if (!course) {
    redirect(`/me/ratings/${reviewId}/edit?error=${encodeURIComponent("Course code is required.")}`);
  }
  if (comment.length > 1200) {
    redirect(`/me/ratings/${reviewId}/edit?error=${encodeURIComponent("Comment is too long (max 1200).")}`);
  }

  // update (only if owner; enforced by RLS + extra eq)
  const { data: updated, error } = await supabase
    .from("reviews")
    .update({
      quality: Math.trunc(quality),
      difficulty: Math.trunc(difficulty),
      would_take_again: wouldTakeAgain === "yes",
      course: course || null,
      grade: grade || null,
      is_online: isOnline,
      tags,
      comment: comment || null,
    })
    .eq("id", reviewId)
    .eq("user_id", user.id)
    .select("teacher_id")
    .maybeSingle();

  if (error || !updated) {
    redirect(`/me/ratings/${reviewId}/edit?error=${encodeURIComponent(error?.message ?? "Update failed.")}`);
  }

  revalidatePath("/me/ratings");
  revalidatePath(`/professor/${updated.teacher_id}`);
  if (teacherId) revalidatePath(`/teacher/${teacherId}`);

  redirect(`/me/ratings?message=${encodeURIComponent("Rating updated.")}`);
}

export async function deleteMyReview(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect(`/login?redirectTo=${encodeURIComponent("/me/ratings")}`);

  if (user.email && !user.email.toLowerCase().endsWith("@basischina.com")) {
    redirect(`/me/ratings?error=${encodeURIComponent("Only internal emails are allowed.")}`);
  }

  const reviewId = String(formData.get("reviewId") ?? "").trim();
  if (!reviewId) redirect(`/me/ratings?error=${encodeURIComponent("Missing review id.")}`);

  const { data: deleted, error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id)
    .select("teacher_id")
    .maybeSingle();

  if (error || !deleted) {
    redirect(`/me/ratings?error=${encodeURIComponent(error?.message ?? "Delete failed.")}`);
  }

  revalidatePath("/me/ratings");
  revalidatePath(`/professor/${deleted.teacher_id}`);
  revalidatePath(`/teacher/${deleted.teacher_id}`);

  redirect(`/me/ratings?message=${encodeURIComponent("Rating deleted.")}`);
}
export async function signOut() {
  "use server";
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/teachers");
}
