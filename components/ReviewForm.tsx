// components/ReviewForm.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import StarRating from "@/components/ui/StarRating";
import { createReview } from "@/lib/actions";

export default function ReviewForm({
  teacherId,
  isAuthed,
  redirectTo,
  suggestedTags,
}: {
  teacherId: string;
  isAuthed: boolean;
  redirectTo: string;
  suggestedTags: string[];
}) {
  const [tags, setTags] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const suggestionChips = useMemo(
    () => Array.from(new Set(suggestedTags.map((t) => t.toUpperCase()))).slice(0, 12),
    [suggestedTags]
  );

  if (!isAuthed) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <div className="text-lg font-semibold">Want to post a review?</div>
        <p className="mt-1 text-sm text-neutral-600">
          You can browse without signing in, but you must sign in to post.
        </p>
        <a
          className="mt-4 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
        >
          Sign in
        </a>
        <div className="mt-2 text-xs text-neutral-500">
          Internal emails only: <span className="font-mono">@basischina.com</span>
        </div>
      </div>
    );
  }

  return (
    <div id="rate" className="rounded-2xl border bg-white p-6">
      <div className="text-lg font-semibold">Rate this teacher</div>
      <p className="mt-1 text-sm text-neutral-600">
        Keep it respectful. Tags help summarize patterns across reviews.
      </p>

      <form
        action={(fd) => {
          // ensure tags input is submitted in uppercase format
          fd.set("tags", tags);
          startTransition(() => createReview(fd));
        }}
        className="mt-6 space-y-5"
      >
        <input type="hidden" name="teacherId" value={teacherId} />

        <div className="grid gap-5 md:grid-cols-2">
          <StarRating name="quality" label="Overall quality" required />
          <StarRating name="difficulty" label="Level of difficulty" required />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">Would take again</div>
            <select
              name="wouldTakeAgain"
              required
              className="mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring"
              defaultValue="yes"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label className="block">
            <div className="text-sm font-medium">Course (optional)</div>
            <input
              name="course"
              placeholder="e.g. MATH, ENG, CHEM"
              className="mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring"
            />
          </label>
        </div>

        <label className="block">
          <div className="text-sm font-medium">Tags (comma-separated)</div>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. TOUGH GRADER, LOTS OF HOMEWORK, FUNNY"
            className="mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring"
          />
          {suggestionChips.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestionChips.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800 hover:bg-neutral-200"
                  onClick={() => {
                    const current = tags
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .map((x) => x.toUpperCase());

                    if (current.includes(t)) return;
                    const next = [...current, t].slice(0, 10).join(", ");
                    setTags(next);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-2 text-xs text-neutral-500">Max 10 tags. Tags will be stored in UPPERCASE.</div>
        </label>

        <label className="block">
          <div className="text-sm font-medium">Comment (optional)</div>
          <textarea
            name="comment"
            placeholder="Write your review..."
            rows={5}
            className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring"
          />
          <div className="mt-2 text-xs text-neutral-500">Max 1200 characters.</div>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Posting..." : "Post review"}
        </button>
      </form>
    </div>
  );
}
