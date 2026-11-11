import type { Metadata } from "next";
import { ReviewStep } from "@/components/event-setup/steps/ReviewStep";

export const metadata: Metadata = { title: "Event setup / Review · EXPER" };

export default function ReviewPage() {
  return <ReviewStep />;
}
