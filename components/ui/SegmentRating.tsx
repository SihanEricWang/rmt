// components/ui/SegmentRating.tsx
"use client";

import { useState } from "react";

export default function SegmentRating({
  name,
  title,
  leftLabel,
  rightLabel,
  required,
}: {
  name: string;
  title: string;
  leftLabel: string;
  rightLabel: string;
  required?: boolean;
}) {
  const [value, setValue] = useState<number>(0);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold">
        {title} <span className="text-red-600">{required ? "*" : ""}</span>
      </div>

      <input type="hidden" name={name} value={value} required={required} />

      <div className="mt-6 flex justify-center">
        <div className="flex w-full max-w-xl overflow-hidden rounded-full bg-neutral-200">
          {Array.from({ length: 5 }, (_, i) => i + 1).map((n, idx) => {
            const selected = value === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setValue(n)}
                className={[
                  "h-12 flex-1",
                  idx !== 0 ? "border-l border-white/80" : "",
                  selected ? "bg-neutral-900" : "bg-neutral-200 hover:bg-neutral-300",
                ].join(" ")}
                aria-label={`${title}: ${n}`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex justify-between text-sm text-neutral-500">
        <div>{leftLabel}</div>
        <div>{rightLabel}</div>
      </div>
    </div>
  );
}
