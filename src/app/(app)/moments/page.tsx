import type { Metadata } from "next";
import { Moments } from "@/components/moments/Moments";

export const metadata: Metadata = { title: "Moments · EXPER" };

export default function MomentsPage() {
  return <Moments />;
}
