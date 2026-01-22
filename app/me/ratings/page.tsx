import Link from "next/link";
// app/me/ratings/page.tsx
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function MyRatingsPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const heyName = user?.email ? user.email.split("@")[0].toUpperCase() : "GUEST";

  const { data: rows } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header heyName={heyName} isAuthed={!!user} active="my_ratings" showSearch={false} />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-2xl font-black tracking-tight">My Ratings</div>

        <div className="mt-6 space-y-4">
          {(rows ?? []).length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-sm text-neutral-700">
              No ratings yet.
              <div className="mt-3">
                <Link className="underline underline-offset-2" href="/teachers" prefetch>
                  Browse teachers
                </Link>
              </div>
            </div>
          ) : (
            (rows ?? []).map((r: any) => (
              <div key={r.id} className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="text-sm text-neutral-700">{r.comment}</div>
                <div className="mt-4 flex items-center gap-3 text-sm">
                  <Link
                    className="rounded-full border bg-white px-4 py-2 font-semibold hover:bg-neutral-50"
                    href={`/me/ratings/${r.id}/edit`}
                    prefetch
                  >
                    Edit
                  </Link>
                  <Link
                    className="rounded-full border bg-white px-4 py-2 font-semibold hover:bg-neutral-50"
                    href={`/teachers/${r.teacher_id}`}
                    prefetch
                  >
                    View teacher
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
