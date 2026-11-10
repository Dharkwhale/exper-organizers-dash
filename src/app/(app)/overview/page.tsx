import type { Metadata } from "next";
import { Suspense } from "react";
import { OverviewContent } from "./OverviewContent";
import { OverviewSkeleton } from "./OverviewSkeleton";

export const metadata: Metadata = { title: "Overview · EXPER" };

export default function OverviewPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContent />
    </Suspense>
  );
}
