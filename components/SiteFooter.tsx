// components/SiteFooter.tsx
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-neutral-600">
        <div className="flex flex-wrap justify-center gap-6">
          <Link className="hover:underline" href="/site-guidelines" prefetch>
            Site Guidelines
          </Link>
          <Link className="hover:underline" href="/terms-and-conditions" prefetch>
            Terms &amp; Conditions
          </Link>
          <Link className="hover:underline" href="/privacy-policy" prefetch>
            Privacy Policy
          </Link>
          <Link className="hover:underline" href="/contact" prefetch>
            Contact Us
          </Link>
        </div>

        <div className="mt-4 text-center text-neutral-500">© 2026 Rate My Teacher, BIPH. All Rights Reserved</div>
      </div>
    </footer>
  );
}
