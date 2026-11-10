import type { MockOverview } from "@/lib/overview/types";
import { Card } from "./Card";

export function TeamActivity({ items }: { items: MockOverview["team"] }) {
  return (
    <Card title="Team activity">
      {items.length === 0 ? (
        <p className="mt-4 text-xs text-muted">No activity yet.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-5">
          {items.map((item) => (
            <li key={`${item.text}-${item.meta}`}>
              <p className="text-sm">{item.text}</p>
              <p className="mt-1 text-[11px] text-muted">{item.meta}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
