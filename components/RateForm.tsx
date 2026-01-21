"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StarRating from "@/components/ui/StarRating";
import SegmentRating from "@/components/ui/SegmentRating";
import { createReview } from "@/lib/actions";

type Props = {
  teacherId: string;
  subjectOptions?: string[];
};

const DEFAULT_DIFFICULTY_LABELS = ["Easy", "Medium", "Hard"];
const DEFAULT_ATTENDANCE_LABELS = ["Never", "Sometimes", "Always"];

export default function RateForm({ teacherId, subjectOptions = [] }: Props) {
  const router = useRouter();

  // Subject (stored in DB as `course` for compatibility)
  const normalizedSubjectOptions = useMemo(() => {
    const unique = Array.from(new Set(subjectOptions.map((s) => s.trim()))).filter(
      Boolean
    );
    return unique;
  }, [subjectOptions]);

  const [subject, setSubject] = useState<string>(
    normalizedSubjectOptions[0] ?? ""
  );

  const [rating, setRating] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<number>(2);
  const [attendance, setAttendance] = useState<number>(2);
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(true);

  const [reviewText, setReviewText] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      // NOTE:
      // - `course` in DB is used to store subject (per your request).
      // - `isOnline` removed from UI; we pass false/0 to keep server action stable.
      const res = await createReview({
        teacherId,
        course: subject,
        rating,
        difficulty,
        attendance,
        recommend: wouldRecommend ? 1 : 0,
        content: reviewText,
        isOnline: 0,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      // Go back to teacher detail page
      router.push(`/teachers/${teacherId}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      {/* Subject select */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Select subject <span className="text-red-500">*</span>
        </label>

        {normalizedSubjectOptions.length > 0 ? (
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
            required
          >
            {normalizedSubjectOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
            This teacher doesn&apos;t have a subject listed yet. Please go back and
            try another teacher.
          </div>
        )}
      </div>

      {/* Overall rating */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Overall rating <span className="text-red-500">*</span>
        </label>
        <div className="rounded-md border border-neutral-200 p-4">
          <StarRating value={rating} onChange={setRating} />
          <p className="mt-2 text-xs text-neutral-500">
            Tap a star to select your rating.
          </p>
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Difficulty</label>
        <div className="rounded-md border border-neutral-200 p-4">
          <SegmentRating
            value={difficulty}
            onChange={setDifficulty}
            labels={DEFAULT_DIFFICULTY_LABELS}
          />
          <p className="mt-2 text-xs text-neutral-500">
            How challenging was the course/subject?
          </p>
        </div>
      </div>

      {/* Attendance */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Attendance</label>
        <div className="rounded-md border border-neutral-200 p-4">
          <SegmentRating
            value={attendance}
            onChange={setAttendance}
            labels={DEFAULT_ATTENDANCE_LABELS}
          />
          <p className="mt-2 text-xs text-neutral-500">
            How often did you attend?
          </p>
        </div>
      </div>

      {/* Recommend */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Would you recommend?</label>
        <div className="flex items-center gap-3 rounded-md border border-neutral-200 p-4">
          <button
            type="button"
            onClick={() => setWouldRecommend(true)}
            className={`rounded-md px-3 py-2 text-sm ${
              wouldRecommend
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 bg-white hover:bg-neutral-50"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setWouldRecommend(false)}
            className={`rounded-md px-3 py-2 text-sm ${
              !wouldRecommend
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 bg-white hover:bg-neutral-50"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Review text */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Write a review</label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="min-h-[120px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
          placeholder="Share details that could help other students…"
        />
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || normalizedSubjectOptions.length === 0 || rating === 0}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Submit rating"}
        </button>

        <button
          type="button"
          onClick={() => router.push(`/teachers/${teacherId}`)}
          className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
