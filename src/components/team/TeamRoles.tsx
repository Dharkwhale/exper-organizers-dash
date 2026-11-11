"use client";

import { buttonClasses } from "@/components/auth/Button";
import { Card } from "@/components/overview/Card";
import { designTeam } from "@/lib/team/mock";

export function TeamRoles() {
  const data = designTeam();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h1 className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight">
              Team / Roles
            </h1>
            <p className="mt-2 text-[11px] text-muted">{data.eventMeta}</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              aria-disabled="true"
              className={buttonClasses("primary", "cursor-not-allowed gap-2")}
            >
              <PlusIcon />
              Invite teammate
            </button>
            <button
              type="button"
              aria-disabled="true"
              className={buttonClasses("secondary", "cursor-not-allowed")}
            >
              View audit log
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.85fr)] xl:items-start">
        <Card title="Workspace team" aside={`/ ${data.memberCount}`}>
          <ul className="mt-5 flex flex-col">
            {data.members.map((member) => (
              <li
                key={member.id}
                className="border-b border-border/50 py-4 last:border-b-0"
              >
                <p className="text-sm">
                  {member.name}
                  {member.badges.map((badge) => (
                    <span key={badge} className="text-muted">
                      {` · ${badge}`}
                    </span>
                  ))}
                  {member.resend ? (
                    <>
                      {" "}
                      <button
                        type="button"
                        aria-disabled="true"
                        className="font-medium text-accent"
                      >
                        Resend
                      </button>
                    </>
                  ) : null}
                </p>
                <p className="mt-1 text-[11px] text-muted">{member.detail}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Role permissions">
          <div className="mt-5 flex flex-col gap-3">
            <FieldButton label="Role" value={data.role} />
            <FieldButton label="Event access" value={data.eventAccess} />
          </div>

          <ul className="mt-5 flex flex-col gap-4">
            {data.permissions.map((permission) => (
              <li key={permission.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 text-sm">{permission.label}</p>
                  <p
                    className={`shrink-0 text-sm ${
                      permission.allowed ? "text-fg" : "text-muted"
                    }`}
                  >
                    {permission.allowed ? "Allowed" : "Not allowed"}
                  </p>
                </div>
                {permission.note ? (
                  <p className="mt-1 text-[11px] text-muted">{permission.note}</p>
                ) : null}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[11px] leading-relaxed text-muted">
            {data.roleKey}
          </p>

          <button
            type="button"
            aria-disabled="true"
            className={buttonClasses("primary", "mt-5 cursor-not-allowed")}
          >
            Save permissions
          </button>
        </Card>
      </div>
    </div>
  );
}

function FieldButton({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      aria-disabled="true"
      className="flex min-h-[4.5rem] w-full cursor-not-allowed flex-col justify-center gap-1 rounded-[1.25rem] bg-surface-2 px-5 py-3 text-left"
    >
      <span className="text-[10px] text-muted">{label}</span>
      <span className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0">{value}</span>
        <span aria-hidden className="shrink-0 text-muted">
          ⌄
        </span>
      </span>
    </button>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="size-3 fill-none stroke-current"
      strokeWidth="1.6"
    >
      <path d="M6 2v8M2 6h8" />
    </svg>
  );
}
