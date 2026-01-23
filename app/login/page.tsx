"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { signInWithPassword, signUpWithEmailAndPassword } from "@/lib/actions";

type Mode = "signin" | "signup";

function Alert({ kind, text }: { kind: "error" | "message"; text: string }) {
  const base = "w-full rounded-lg border px-4 py-3 text-sm leading-5";
  const cls =
    kind === "error"
      ? `${base} border-red-300 bg-red-50 text-red-800`
      : `${base} border-emerald-300 bg-emerald-50 text-emerald-900`;

  return <div className={cls}>{text}</div>;
}

/**
 * ✅ 防 open-redirect：只允许站内相对路径
 * - 必须以 "/" 开头
 * - 不能以 "//" 开头（协议相对地址）
 * - 不能包含 "://"
 */
function sanitizeRedirectTo(value: string | null | undefined, fallback = "/teachers") {
  const v = (value ?? "").trim();
  if (!v) return fallback;
  if (!v.startsWith("/")) return fallback;
  if (v.startsWith("//")) return fallback;
  if (v.includes("://")) return fallback;
  return v;
}

function pickModeFromParams(sp: URLSearchParams): Mode {
  const modeRaw = (sp.get("mode") ?? "").toLowerCase();
  if (modeRaw === "signup" || modeRaw === "register") return "signup";
  if (modeRaw === "signin" || modeRaw === "login") return "signin";

  const error = (sp.get("error") ?? "").toLowerCase();
  // 这些错误更像是注册流程产生的（保留你的逻辑，但更稳健）
  if (error.includes("do not match") || error.includes("match") || error.includes("at least 8")) return "signup";

  return "signin";
}

function SubmitButton({
  idleText,
  pendingText,
  variant = "primary",
}: {
  idleText: string;
  pendingText: string;
  variant?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();

  const base =
    "w-full rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";
  const cls =
    variant === "primary"
      ? `${base} bg-black text-white hover:opacity-90`
      : `${base} border bg-white hover:bg-neutral-50`;

  return (
    <button type="submit" className={cls} disabled={pending} aria-busy={pending}>
      {pending ? pendingText : idleText}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const message = searchParams.get("message") ?? undefined;
  const error = searchParams.get("error") ?? undefined;

  // ✅ important: allow redirect back to the page that required auth
  const redirectTo = sanitizeRedirectTo(searchParams.get("redirectTo"), "/teachers");

  // ✅ 前端模式：切换 tab 立即响应，不依赖整页路由切换
  const [mode, setMode] = React.useState<Mode>(() => pickModeFromParams(searchParams));

  // 当 URL 的 mode 被外部改变（例如复制链接/后退前进）时，同步本地状态
  React.useEffect(() => {
    const nextMode = pickModeFromParams(searchParams);
    setMode(nextMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // ✅ 切换 tab：立即 setState，同时仅同步 URL（replace 不产生历史堆栈污染）
  const updateUrlMode = React.useCallback(
    (nextMode: Mode) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("mode", nextMode);
      next.set("redirectTo", redirectTo);
      router.replace(`/login?${next.toString()}`, { scroll: false });
    },
    [router, searchParams, redirectTo]
  );

  const onClickTab = (nextMode: Mode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    updateUrlMode(nextMode);
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">Rate My Teacher</h1>
            <p className="mt-2 text-sm text-neutral-600">
              BASIS International School Park Lane Harbor (High School)
            </p>
            <p className="mt-3 text-sm text-neutral-700">Viewing is public. Posting reviews requires sign in.</p>
            <p className="mt-1 text-sm font-medium text-neutral-800">
              Only internal email addresses (<span className="font-mono">@basischina.com</span>) are allowed.
            </p>
          </div>

          <div className="mb-6 space-y-3">
            {error ? <Alert kind="error" text={error} /> : null}
            {message ? <Alert kind="message" text={message} /> : null}
          </div>

          <div className="mx-auto w-full max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
            {/* Tabs */}
            <div className="mb-6">
              <div className="inline-flex w-full rounded-full bg-neutral-100 p-1">
                <button
                  type="button"
                  onClick={() => onClickTab("signin")}
                  className={[
                    "flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition",
                    mode === "signin" ? "bg-white shadow-sm" : "text-neutral-600 hover:text-neutral-900",
                  ].join(" ")}
                  aria-current={mode === "signin" ? "page" : undefined}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => onClickTab("signup")}
                  className={[
                    "flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition",
                    mode === "signup" ? "bg-white shadow-sm" : "text-neutral-600 hover:text-neutral-900",
                  ].join(" ")}
                  aria-current={mode === "signup" ? "page" : undefined}
                >
                  Create account
                </button>
              </div>

              <p className="mt-3 text-sm text-neutral-600">
                {mode === "signin"
                  ? "Use your internal school email to sign in and post reviews."
                  : "Registration is open to internal emails only. We’ll send a verification email."}
              </p>
            </div>

            {/* Content */}
            {mode === "signin" ? (
              <section>
                <form action={signInWithPassword} className="space-y-4">
                  {/* ✅ redirect after sign-in */}
                  <input type="hidden" name="redirectTo" value={redirectTo} />

                  <label className="block">
                    <span className="text-sm font-medium">Email</span>
                    <input
                      name="email"
                      type="email"
                      placeholder="name@basischina.com"
                      autoComplete="email"
                      required
                      inputMode="email"
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Password</span>
                    <input
                      name="password"
                      type="password"
                      placeholder="Your password"
                      autoComplete="current-password"
                      required
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring"
                    />
                  </label>

                  <SubmitButton idleText="Sign in" pendingText="Signing in..." variant="primary" />

                  <p className="text-xs text-neutral-500">
                    If you just created an account, verify your email first, then sign in.
                  </p>
                </form>
              </section>
            ) : (
              <section>
                <form action={signUpWithEmailAndPassword} className="space-y-4">
                  {/* ✅ redirect after sign-up / verification flow consistency */}
                  <input type="hidden" name="redirectTo" value={redirectTo} />

                  <label className="block">
                    <span className="text-sm font-medium">Email</span>
                    <input
                      name="email"
                      type="email"
                      placeholder="name@basischina.com"
                      autoComplete="email"
                      required
                      inputMode="email"
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Password</span>
                    <input
                      name="password"
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">Confirm password</span>
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring"
                    />
                  </label>

                  <SubmitButton idleText="Create account" pendingText="Creating..." variant="secondary" />

                  <p className="text-xs text-neutral-500">
                    After verifying your email, come back and sign in to post reviews.
                  </p>
                </form>
              </section>
            )}
          </div>

          <p className="mt-6 text-xs text-neutral-500">Your ratings are always anonymous.</p>
        </div>
      </div>
    </main>
  );
}
