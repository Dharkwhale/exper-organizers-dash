import { formatLongDate } from "@/lib/overview/format";
import { ActionButton } from "./ActionButton";

export function PageHeading({ now }: { now: Date }) {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        The night, in view.
      </h1>
      <p className="mt-2 text-[11px] text-muted">
        {`${formatLongDate(now)} · Your events, from first idea to last memory.`}
      </p>
      <div className="mt-8">
        <ActionButton variant="primary" icon="+">
          Create event
        </ActionButton>
      </div>
    </div>
  );
}
