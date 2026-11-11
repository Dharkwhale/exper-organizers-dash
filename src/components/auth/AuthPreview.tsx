const NAV = ["Overview", "Events", "Live control", "Attendees", "Sales", "Moments", "Reports"];
const SQUADS = ["Lunar Drifters", "Owambe Crew", "Afro Brunch Club"];

/**
 * A static picture of the live-control screen, for the sign-in side panel.
 * Every figure here is illustrative sample content, not real data, and the
 * whole thing is hidden from assistive tech.
 */
export function AuthPreview() {
  return (
    <div
      data-auth-preview
      aria-hidden="true"
      className="relative hidden overflow-hidden rounded-2xl lg:block lg:max-h-[clamp(12rem,38vh,22rem)]"
    >
      <div className="flex items-center gap-2 bg-accent px-4 py-2 text-[11px] font-semibold text-accent-fg">
        <span className="size-1.5 rounded-full bg-accent-fg" />
        Live now · Neon Solstice · 1,240 inside
      </div>

      <div className="grid grid-cols-[8.5rem_1fr] bg-bg/60">
        <ul className="flex flex-col gap-1 border-r border-border/40 p-3 text-[11px] text-muted">
          {NAV.map((label) => (
            <li
              key={label}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${
                label === "Live control" ? "bg-surface-2 text-fg" : ""
              }`}
            >
              {label === "Live control" ? (
                <span className="size-1.5 rounded-full bg-accent" />
              ) : null}
              {label}
            </li>
          ))}
        </ul>

        <div className="min-w-0 p-4">
          <p className="text-base font-semibold">Live control</p>
          <p className="mt-0.5 text-[10px] text-muted">Started 8:14 PM · 2h 31m in</p>

          <div className="mt-3 grid grid-cols-[1.1fr_1fr] gap-3">
            <div className="rounded-2xl bg-accent p-3 text-accent-fg">
              <p className="flex justify-between text-[10px]">
                <span>Prompt 4 of 9</span>
                <span className="font-semibold">00:42</span>
              </p>
              <p className="mt-2 text-3xl font-bold leading-none tracking-tight">Look up.</p>
              <div className="mt-3 h-1 rounded-full bg-accent-fg/20">
                <div className="h-full w-[62%] rounded-full bg-accent-fg" />
              </div>
              <p className="mt-1.5 text-[10px] font-semibold">62% answered</p>
            </div>

            <div className="rounded-2xl bg-surface-2 p-3">
              <p className="text-[10px] text-muted">People active</p>
              <p className="mt-1 text-2xl font-semibold leading-none">
                281 <span className="text-[9px] font-normal text-muted">peak at 11:42 PM</span>
              </p>
              <svg viewBox="0 0 100 30" className="mt-3 h-8 w-full" fill="none">
                <polyline
                  points="0,24 18,22 36,20 52,6 66,14 82,17 100,15"
                  stroke="currentColor"
                  className="text-muted"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </div>

          <p className="mt-4 text-xs font-semibold">Squads</p>
          <ol className="mt-1 text-[11px]">
            {SQUADS.map((name, index) => (
              <li
                key={name}
                className="flex gap-4 border-b border-border/40 py-2"
                style={{ opacity: 1 - index * 0.3 }}
              >
                <span className={index === 0 ? "text-accent" : "text-muted"}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {name}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
    </div>
  );
}
