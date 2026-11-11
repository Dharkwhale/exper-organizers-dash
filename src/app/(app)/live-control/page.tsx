import type { Metadata } from "next";
import { LiveControl } from "@/components/live-control/LiveControl";

export const metadata: Metadata = { title: "Live Control · EXPER" };

export default function LiveControlPage() {
  return <LiveControl />;
}
