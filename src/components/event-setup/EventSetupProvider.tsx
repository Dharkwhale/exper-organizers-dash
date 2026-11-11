"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { designEventDraft } from "@/lib/event-setup/mock";
import type { EventDraft } from "@/lib/event-setup/types";

type SetupContextValue = {
  draft: EventDraft;
  setDraft: (patch: Partial<EventDraft>) => void;
  updateTicket: (
    id: string,
    patch: Partial<EventDraft["tickets"][number]>,
  ) => void;
};

const EventSetupContext = createContext<SetupContextValue | null>(null);

export function EventSetupProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<EventDraft>(() => designEventDraft());

  const value = useMemo<SetupContextValue>(
    () => ({
      draft,
      setDraft: (patch) => setDraftState((current) => ({ ...current, ...patch })),
      updateTicket: (id, patch) =>
        setDraftState((current) => ({
          ...current,
          tickets: current.tickets.map((ticket) =>
            ticket.id === id ? { ...ticket, ...patch } : ticket,
          ),
        })),
    }),
    [draft],
  );

  return (
    <EventSetupContext.Provider value={value}>{children}</EventSetupContext.Provider>
  );
}

export function useEventSetup(): SetupContextValue {
  const value = useContext(EventSetupContext);
  if (!value) {
    throw new Error("useEventSetup must be used inside EventSetupProvider");
  }
  return value;
}
