export function EventsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your events"
      className="mx-auto flex max-w-6xl animate-pulse flex-col gap-6"
    >
      <div className="h-20 w-1/2 rounded-3xl bg-surface" />
      <div className="h-12 w-72 rounded-full bg-surface" />
      <div className="h-16 rounded-3xl bg-surface" />
      <div className="h-96 rounded-3xl bg-surface" />
    </div>
  );
}
