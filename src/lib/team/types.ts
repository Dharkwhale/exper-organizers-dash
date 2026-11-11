export type TeamMember = {
  id: string;
  name: string;
  badges: string[];
  detail: string;
  resend?: boolean;
};

export type RolePermission = {
  id: string;
  label: string;
  allowed: boolean;
  note?: string;
};

export type TeamData = {
  eventMeta: string;
  memberCount: string;
  members: TeamMember[];
  role: string;
  eventAccess: string;
  permissions: RolePermission[];
  roleKey: string;
};
