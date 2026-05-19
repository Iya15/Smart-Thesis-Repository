"use client";

import { useAuth } from "../../../hooks/useAuth";

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user.name} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s an overview of your activity on the platform.
        </p>
      </div>

      {/* Role badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Signed in as</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            user.role === "ADMIN"
              ? "bg-rose-100 text-rose-700"
              : user.role === "ADVISER"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {user.role}
        </span>
      </div>

      {/* Stat cards — data wired in later milestones */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Theses"
          value="—"
          description="Approved theses in the repository"
        />
        <StatCard
          label="My Uploads"
          value="—"
          description="Theses you have submitted"
        />
        <StatCard
          label="Bookmarks"
          value="—"
          description="Theses saved for later"
        />
      </div>

      {/* Placeholder recent activity */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-base font-semibold text-slate-900">
          Recent Activity
        </h2>
        <p className="mt-4 text-sm text-slate-400">
          Your recent uploads and bookmarks will appear here.
        </p>
      </div>
    </div>
  );
}
