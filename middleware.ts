// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  // Supabase SSR 会在 cookie 里存 session（常见前缀 sb-...）
  // 没有任何相关 cookie 时，没必要调用 auth.getUser()（省一次网络请求）
  return request.cookies
    .getAll()
    .some(
      (c) =>
        c.name.startsWith("sb-") ||
        c.name === "supabase-auth-token" ||
        c.name === "sb-access-token" ||
        c.name === "sb-refresh-token"
    );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 没有 session 相关 cookie：直接放行（游客访问不触发 Supabase Auth）
  if (!hasSupabaseAuthCookie(request)) return response;

  const supabase = createServerClient(
    mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
    mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ✅ 必须 await：让 Supabase 有机会刷新 session 并把 Set-Cookie 写进 response
  try {
    await supabase.auth.getUser();
  } catch {
    // Supabase 临时不可达时不阻塞页面（按游客渲染）
  }

  return response;
}

export const config = {
  // 只在需要“登录态/刷新 session”的路由上启用 middleware，显著降低边缘调用和 Auth 请求量
  matcher: ["/me/:path*", "/admin/:path*", "/teachers/:path*"],
};
