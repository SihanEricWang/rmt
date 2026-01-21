// components/HeyMenu.tsx
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { signOut } from "@/lib/actions";

export default function HeyMenu({
  heyName,
  isAuthed,
}: {
  heyName: string;
  isAuthed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // close on outside click + Esc
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // guest: just show text (no menu)
  if (!isAuthed) {
    return <div className="text-sm font-extrabold tracking-wide">HEY, {heyName}</div>;
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-extrabold tracking-wide hover:bg-white/10"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        HEY, {heyName}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-80">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border bg-white text-black shadow-lg"
        >
          <a
            role="menuitem"
            href="/me/tickets"
            className="block px-4 py-3 text-sm hover:bg-neutral-50"
            onClick={() => setOpen(false)}
          >
            我的工单
          </a>

          <a
            role="menuitem"
            href="/me/ratings"
            className="block px-4 py-3 text-sm hover:bg-neutral-50"
            onClick={() => setOpen(false)}
          >
            My ratings
          </a>

          <div className="h-px bg-neutral-200" />

          <form
            action={() => {
              startTransition(async () => {
                await signOut();
              });
            }}
          >
            <button
              role="menuitem"
              type="submit"
              disabled={pending}
              className="block w-full px-4 py-3 text-left text-sm hover:bg-neutral-50 disabled:opacity-60"
            >
              {pending ? "Logging out..." : "Logout"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
