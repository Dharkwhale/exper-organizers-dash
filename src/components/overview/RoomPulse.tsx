import { sparklinePath } from "@/lib/overview/sparkline";
import type { MockOverview } from "@/lib/overview/types";
import { Card } from "./Card";

const WIDTH = 300;
const HEIGHT = 60;

// Five labels along the axis, however many points the series has.
function axisLabels(series: MockOverview["room"]["series"]): string[] {
  const last = series.length - 1;
  const indexes = new Set([0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * last)));
  return [...indexes].map((i) => series[i].label);
}

export function RoomPulse({ room }: { room: MockOverview["room"] }) {
  const path = sparklinePath(
    room.series.map((point) => point.value),
    WIDTH,
    HEIGHT,
  );

  return (
    <Card title="Tonight's room" aside="Live">
      <div className="mt-4 flex justify-between text-[10px] text-muted">
        <span>{room.mood}</span>
        <span>{`${room.reactions} reactions · 5-min intervals`}</span>
      </div>

      {path ? (
        <>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            role="img"
            aria-label="Reactions over time"
            className="mt-3 h-20 w-full"
          >
            <path
              data-series
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            {axisLabels(room.series).map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-6 text-xs text-muted">No reactions yet.</p>
      )}

      <p className="mt-5 text-[11px] leading-relaxed text-muted">
        {`Electric is the most selected feeling. Based on ${room.reactions} attendees, not the full room.`}
      </p>
    </Card>
  );
}
