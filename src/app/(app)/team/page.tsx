import type { Metadata } from "next";
import { TeamRoles } from "@/components/team/TeamRoles";

export const metadata: Metadata = { title: "Team / Roles · EXPER" };

export default function TeamPage() {
  return <TeamRoles />;
}
