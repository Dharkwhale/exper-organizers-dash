import type { Metadata } from "next";
import { Sales } from "@/components/sales/Sales";

export const metadata: Metadata = { title: "Sales · EXPER" };

export default function SalesPage() {
  return <Sales />;
}
