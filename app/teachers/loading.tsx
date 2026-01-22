// app/teachers/loading.tsx
export default function LoadingTeachers() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="h-12 w-full animate-pulse rounded-full bg-neutral-200" />
        <div className="mt-8 h-7 w-72 animate-pulse rounded bg-neutral-200" />

        <div className="mt-6 space-y-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex gap-6">
                <div className="h-28 w-28 animate-pulse rounded-xl bg-neutral-200" />
                <div className="flex-1">
                  <div className="h-7 w-60 animate-pulse rounded bg-neutral-200" />
                  <div className="mt-3 h-4 w-40 animate-pulse rounded bg-neutral-200" />
                  <div className="mt-6 h-4 w-72 animate-pulse rounded bg-neutral-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
