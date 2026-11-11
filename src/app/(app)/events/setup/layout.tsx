import type { ReactNode } from "react";
import { EventSetupProvider } from "@/components/event-setup/EventSetupProvider";

export default function EventSetupLayout({ children }: { children: ReactNode }) {
  return <EventSetupProvider>{children}</EventSetupProvider>;
}
