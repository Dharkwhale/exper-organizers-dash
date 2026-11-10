import type { MockOverview } from "@/lib/overview/types";
import { Card } from "./Card";

export function AttentionList({ items }: { items: MockOverview["attention"] }) {
  return (
    <Card title="Your attention, in order">
      {items.length === 0 ? (
        <p className="mt-4 text-xs text-muted">Nothing needs you right now.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-5">
          {items.map((item) => (
            <li key={item.title}>
              <p className="flex items-baseline gap-3 text-sm">
                <span>{item.title}</span>
                <span aria-disabled="true" className="text-[11px] text-muted">
                  {`${item.action} →`}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
