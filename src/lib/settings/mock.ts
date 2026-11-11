import type { SettingsData } from "./types";

/** Figma Settings (Workspace tab) for Afterhours studio. */
export function designSettings(): SettingsData {
  return {
    eventMeta: "Workspace preferences, security and event defaults.",
    organisation: [
      {
        id: "workspace-name",
        label: "Workspace name",
        value: "Afterhours studio",
        focused: true,
      },
      {
        id: "legal-name",
        label: "Legal business name",
        value: "Afterhours Studio Ltd",
      },
      {
        id: "contact-email",
        label: "Contact email",
        value: "hello@afterhours.studio",
      },
      {
        id: "support-website",
        label: "Support website",
        value: "afterhours.studio/support",
      },
    ],
    security: [
      {
        id: "s1",
        label: "Two-step verification",
        status: "On",
        detail: "Authenticator app enabled",
      },
      {
        id: "s2",
        label: "Active sessions",
        status: "Review",
        detail: "MacBook · Lagos · This device",
        statusAccent: true,
      },
      {
        id: "s3",
        label: "Sign-in alerts",
        status: "On",
        detail: "Email on a new device sign-in",
      },
    ],
    notifications: [
      {
        id: "n1",
        label: "Live incident alerts",
        status: "On",
        detail: "Push + email · Event team only",
      },
      {
        id: "n2",
        label: "Payout updates",
        status: "On",
        detail: "Email · Finance and Owner",
      },
      {
        id: "n3",
        label: "Daily summary",
        status: "Off",
        detail: "Email at 09:00 in your timezone",
      },
    ],
    eventDefaults: {
      intro:
        "These are starting values for new events, never product-wide constants. Each event keeps its own venue, timezone and currency.",
      fields: [
        {
          id: "country",
          label: "Suggested country",
          value: "Ask when creating each event",
        },
        {
          id: "timezone",
          label: "Timezone",
          value: "Choose per event (IANA)",
        },
        {
          id: "currency",
          label: "Currency",
          value: "Choose per event",
        },
      ],
      photoReview: {
        id: "photo",
        label: "Photo review",
        status: "On",
        detail: "Require approval before sharing",
      },
    },
    workspaceControls: {
      body: "Deleting a workspace requires Owner verification. Financial records follow retention rules.",
    },
  };
}
