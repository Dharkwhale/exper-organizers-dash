import type { Metadata } from "next";
import { Payouts } from "@/components/payouts/Payouts";

export const metadata: Metadata = { title: "Payouts · EXPER" };

export default function PayoutsPage() {
  return <Payouts />;
}
