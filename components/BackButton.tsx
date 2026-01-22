// components/BackButton.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function BackButton({
  className,
  fallbackHref = "/",
  children,
}: {
  className?: string;
  fallbackHref?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        // 正常情况：直接浏览器后退
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
          return;
        }
        // 兜底：如果没有历史记录（比如直接打开这个页面），就跳到 fallback
        router.push(fallbackHref);
      }}
      aria-label="Back"
    >
      {children ?? (
        <>
          <span aria-hidden>←</span>
          Back
        </>
      )}
    </button>
  );
}
