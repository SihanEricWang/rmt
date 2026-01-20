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
  courseSuggestions,
}: {
  teacherId: string;
  courseSuggestions: string[];
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [wouldTakeAgain, setWouldTakeAgain] = useState<"yes" | "no" | "">("");

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
        fd.set("course", course.trim());
        fd.set("grade", grade || "");
        fd.set("isOnline", isOnline ? "1" : "0");
        fd.set("wouldTakeAgain", wouldTakeAgain || "");
        fd.set("tags", selectedTags.join(", "));
        fd.set("comment", comment);

        // ✅ enforce RMP-like rules on server side too
        fd.set("requireCourse", "1");
        fd.set("requireComment", "1");
        fd.set("maxTags", "3");
        fd.set("commentLimit", "350");

        startTransition(() => createReview(fd));
      }}
      className="space-y-6"
    >
      {/* 1) Course code */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold">
          Select Course Code <span className="text-red-600">*</span>
        </div>

        <div className="mt-5 flex flex-col items-center gap-4">
          {/* datalist looks like dropdown but allows custom typing */}
          <div className="w-full max-w-xl">
            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              list="courseCodes"
              placeholder="Select Course Code"
              className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring"
              required
              name="course_input"
            />
            <datalist id="courseCodes">
              {courseSuggestions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <label className="flex items-center gap-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="h-4 w-4"
            />
            This is an online course
          </label>
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
              <label key={opt.v} className="flex flex-col items-center gap-3 text-sm text-neutral-700">
                <input
                  type="radio"
                  name="wouldTakeAgainRadio"
                  value={opt.v}
                  checked={checked}
                  onChange={() => setWouldTakeAgain(opt.v)}
                  className="h-6 w-6"
                  required
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
          <div className="w-full max-w-xl">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring"
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
      </div>

      {/* 6) Tags */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold">Select up to 3 tags</div>

        <div className="mt-4 flex flex-wrap gap-3">
          {tagOptions.map((t) => {
            const active = selectedTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTag(t)}
                className={[
                  "rounded-full px-4 py-2 text-xs font-semibold",
                  active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
                ].join(" ")}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-neutral-500">
          Selected: {selectedTags.length}/3
        </div>
      </div>

      {/* 7) Write a Review */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm" id="guidelines">
        <div className="text-sm font-semibold">
          Write a Review <span className="text-red-600">*</span>
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          Discuss the teacher&apos;s teaching style and ability to convey the material clearly.
        </p>

        <details className="mt-4 rounded-xl border bg-neutral-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold">Guidelines</summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">
            <li>Your rating could be removed if you use profanity or derogatory terms.</li>
            <li>Don&apos;t claim that the teacher shows bias or favoritism for or against students.</li>
            <li>Don&apos;t forget to proofread!</li>
          </ul>
        </details>

        <div className="mt-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, charLimit))}
            placeholder="What do you want other students to know about this teacher?"
            className="h-44 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:ring"
            required
          />
          <div className="mt-2 text-right text-xs text-neutral-500">
            {comment.length}/{charLimit}
          </div>
        </div>
      </div>

      {/* 8) Submit area */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-center text-xs text-neutral-600">
          By clicking the &quot;Submit&quot; button, you acknowledge that you have read and agreed to the site
          guidelines and terms. (Internal project for BIPH)
        </p>

        <div className="mt-5 flex justify-center">
          <button
            type="submit"
            disabled={isPending}
            className="h-11 w-72 rounded-full bg-neutral-400 text-sm font-semibold text-white hover:bg-neutral-500 disabled:opacity-60"
          >
            {isPending ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </form>
  );
}
