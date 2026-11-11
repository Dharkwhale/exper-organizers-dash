import { formatEventLine } from "@/lib/overview/format";
import type { ComingUpItem } from "@/lib/overview/types";
import { Card } from "./Card";

export function ComingUp({
  items,
  total,
}: {
  items: ComingUpItem[];
  total: number;
}) {
  return (
    <Card
      title="Coming up"
      aside={total > 0 ? `${total} ${total === 1 ? "event" : "events"}` : undefined}
    >
      {items.length === 0 ? (
        <p className="mt-4 text-xs text-muted">No upcoming events yet.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-5">
          {items.map((item) => (
            <li key={item.id}>
              <p className="flex items-baseline gap-3 text-sm">
                <span>{item.title}</span>
                <span aria-disabled="true" className="text-[11px] text-fg/80">
                  Manage ↗
                </span>
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {formatEventLine(item, item.timezone)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
