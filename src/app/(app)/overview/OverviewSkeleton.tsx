export function OverviewSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your overview"
      className="mx-auto flex max-w-6xl animate-pulse flex-col gap-6"
    >
      <div className="h-24 w-2/3 rounded-3xl bg-surface" />
      <div className="h-64 rounded-3xl bg-surface" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="h-72 rounded-3xl bg-surface" />
        <div className="h-72 rounded-3xl bg-surface" />
      </div>
    </div>
  );
}
