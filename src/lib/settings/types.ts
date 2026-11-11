export type SettingsTab = "workspace" | "security" | "notifications";

export type SettingsField = {
  id: string;
  label: string;
  value: string;
  focused?: boolean;
};

export type SettingsStatusRow = {
  id: string;
  label: string;
  status: string;
  detail: string;
  statusAccent?: boolean;
};

export type SettingsData = {
  eventMeta: string;
  organisation: SettingsField[];
  security: SettingsStatusRow[];
  notifications: SettingsStatusRow[];
  eventDefaults: {
    intro: string;
    fields: SettingsField[];
    photoReview: SettingsStatusRow;
  };
  workspaceControls: {
    body: string;
  };
};
