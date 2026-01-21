// components/RateForm.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import SegmentRating from "@/components/ui/SegmentRating";
import { createReview } from "@/lib/actions";

const TAG_OPTIONS = [
  "TOUGH GRADER",
  "GET READY TO READ",
  "PARTICIPATION MATTERS",
  "EXTRA CREDIT",
  "GROUP PROJECTS",
  "AMAZING LECTURES",
  "CLEAR GRADING CRITERIA",
  "GIVES GOOD FEEDBACK",
  "INSPIRATIONAL",
  "LOTS OF HOMEWORK",
  "HILARIOUS",
  "BEWARE OF POP QUIZZES",
  "SO MANY PAPERS",
  "CARING",
  "RESPECTED",
  "LECTURE HEAVY",
  "TEST HEAVY",
  "GRADED BY FEW THINGS",
  "ACCESSIBLE OUTSIDE CLASS",
  "ONLINE SAVVY",
];

const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", "P", "NP"];

export default function RateForm({
  teacherId,
  teacherSubject,
}: {
  teacherId: string;
  teacherSubject: string | null;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [grade, setGrade] = useState("");
  const [wouldTakeAgain, setWouldTakeAgain] = useState<"yes" | "no" | "">("");

  // ✅ Subject dropdown (single-option from teacher)
  const subjectValue = (teacherSubject ?? "").trim() || "UNKNOWN";
  const [subject, setSubject] = useState(subjectValue);

  const [isPending, startTransition] = useTransition();

  const tagOptions = useMemo(() => TAG_OPTIONS, []);
  const charLimit = 350;

  function toggleTag(t: string) {
    setSelectedTags((prev) => {
      const has = prev.includes(t);
      if (has) return prev.filter((x) => x !== t);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, t];
    });
  }

  return (
    <form
      action={(fd) => {
        fd.set("teacherId", teacherId);

        // ✅ map selected subject into the backend "course" field (no schema change needed)
        fd.set("course", subject.trim());

        fd.set("grade", grade || "");
        fd.set("wouldTakeAgain", wouldTakeAgain || "");
        fd.set("tags", selectedTags.join(", "));
        fd.set("comment", comment);

        startTransition(() => createReview(fd));
      }}
      className="space-y-6"
    >
      {/* 1) Subject */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold">
          Select subject <span className="text-red-600">*</span>
        </div>

        <div className="mt-5 flex flex-col items-center gap-4">
          <div className="w-full max-w-xl">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring"
              required
              name="subject_select"
            >
              {/* single option from teacher.subject */}
              <option value={subjectValue}>{subjectValue}</option>
            </select>
          </div>

          {/* ✅ removed: "This is an online course" checkbox */}
        </div>
      </div>

      {/* 2) Quality */}
      <SegmentRating
        name="quality"
        title="Rate your teacher"
        leftLabel="1 - Awful"
        rightLabel="5 - Awesome"
        required
      />

      {/* 3) Difficulty */}
      <SegmentRating
        name="difficulty"
        title="How difficult was this teacher?"
        leftLabel="1 - Very Easy"
        rightLabel="5 - Very Difficult"
        required
      />

      {/* 4) Would take again */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold">
          Would you take this teacher again? <span className="text-red-600">*</span>
        </div>

        <div className="mt-6 flex justify-center gap-16">
          {[
            { v: "yes" as const, label: "Yes" },
            { v: "no" as const, label: "No" },
          ].map((opt) => {
            const checked = wouldTakeAgain === opt.v;
            return (
              <label key={opt.v} className="flex items-center gap-3 text-sm font-semibold text-neutral-800">
                <input
                  type="radio"
                  checked={checked}
                  onChange={() => setWouldTakeAgain(opt.v)}
                  value={opt.v}
                  className="h-6 w-6"
                  required
                  name="wouldTakeAgainRadio"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* 5) Grade */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold">Select grade received</div>
        <div className="mt-5 flex justify-center">
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="h-11 w-full max-w-xl rounded-xl border bg-white px-3 text-sm outline-none focus:ring"
            name="grade_select"
          >
            <option value="">Select grade</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6) Tags */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold">Tags (choose up to 3)</div>
        <div className="mt-4 flex flex-wrap gap-3">
          {tagOptions.map((t) => {
            const active = selectedTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={`rounded-full border px-4 py-2 text-xs font-extrabold tracking-wide transition ${
                  active ? "bg-black text-white" : "bg-white text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7) Comment */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold">Comment (optional)</div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, charLimit))}
          placeholder="Write your review..."
          className="mt-4 min-h-[160px] w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:ring"
        />

        <div className="mt-2 text-xs text-neutral-500">
          Max {charLimit} characters.
        </div>
      </div>

      <div className="flex justify-start">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Posting..." : "Post review"}
        </button>
      </div>
    </form>
  );
}
