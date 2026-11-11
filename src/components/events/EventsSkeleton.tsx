/** Mirrors the Events page: title, tab pills, search row and a few event rows. */
export function EventsSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading your events"
      className="mx-auto flex max-w-6xl animate-pulse flex-col gap-6"
    >
      <div>
        <div className="h-12 w-64 rounded-2xl bg-surface" />
        <div className="mt-3 h-3 w-96 max-w-full rounded-full bg-surface" />
        <div className="mt-8 h-11 w-36 rounded-full bg-surface" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[88, 64, 64, 76].map((width, index) => (
          <div
            key={index}
            data-skeleton-tab
            className="h-10 rounded-full bg-surface"
            style={{ width }}
          />
        ))}
      </div>

      <div data-skeleton-search className="h-16 rounded-2xl bg-surface" />

      <div className="rounded-3xl bg-surface p-5 sm:p-6">
        <div className="h-5 w-40 rounded-full bg-surface-2" />
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            data-skeleton-row
            className="mt-4 flex items-center gap-4 border-b border-border/60 py-6 last:border-b-0"
          >
            <div className="h-24 w-20 shrink-0 rounded-2xl bg-surface-2" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-48 max-w-full rounded-full bg-surface-2" />
              <div className="h-3 w-40 max-w-full rounded-full bg-surface-2" />
              <div className="h-3 w-56 max-w-full rounded-full bg-surface-2" />
            </div>
            <div className="hidden h-10 w-32 rounded-full bg-surface-2 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
