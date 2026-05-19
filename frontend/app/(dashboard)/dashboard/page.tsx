"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../lib/api";
import { AdminStats, IThesis } from "../../../types";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  description,
  accent,
  loading,
}: {
  label: string;
  value: string | number;
  description: string;
  accent?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-2 h-9 w-16 animate-pulse rounded-md bg-slate-200" />
      ) : (
        <p className={`mt-2 text-3xl font-bold ${accent ?? "text-slate-900"}`}>
          {value}
        </p>
      )}
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

// ─── Admin stats section ──────────────────────────────────────────────────────

function AdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: AdminStats }>("/api/admin/stats")
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total Users"
        value={stats?.totalUsers ?? "—"}
        description="Registered accounts"
        loading={loading}
      />
      <StatCard
        label="Total Theses"
        value={stats?.totalTheses ?? "—"}
        description="Across all statuses"
        loading={loading}
      />
      <StatCard
        label="Pending"
        value={stats?.pendingTheses ?? "—"}
        description="Awaiting review"
        accent={(stats?.pendingTheses ?? 0) > 0 ? "text-amber-600" : undefined}
        loading={loading}
      />
      <StatCard
        label="Approved"
        value={stats?.approvedTheses ?? "—"}
        description="Published to repository"
        accent="text-green-600"
        loading={loading}
      />
      <StatCard
        label="AI Requests"
        value={stats?.totalAiRequests ?? "—"}
        description="Total Gemini calls"
        loading={loading}
      />
    </div>
  );
}

// ─── Student/Adviser personal stats section ───────────────────────────────────

function PersonalStats() {
  const [uploads, setUploads] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<number | null>(null);
  const [aiToday, setAiToday] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<{ data: IThesis[] }>("/api/theses/mine"),
      api.get<{ data: IThesis[] }>("/api/bookmarks"),
      api.get<{ data: { count: number } }>("/api/ai/usage"),
    ]).then(([uploadsRes, bookmarksRes, aiRes]) => {
      if (uploadsRes.status === "fulfilled")
        setUploads(uploadsRes.value.data.data.length);
      if (bookmarksRes.status === "fulfilled")
        setBookmarks(bookmarksRes.value.data.data.length);
      if (aiRes.status === "fulfilled")
        setAiToday(aiRes.value.data.data.count);
      setLoading(false);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="My Uploads"
        value={uploads ?? "—"}
        description="Theses you have submitted"
        loading={loading}
      />
      <StatCard
        label="Bookmarks"
        value={bookmarks ?? "—"}
        description="Theses saved for later"
        loading={loading}
      />
      <StatCard
        label="AI Requests Today"
        value={aiToday !== null ? `${aiToday} / 10` : "—"}
        description="Daily limit resets at midnight"
        accent={(aiToday ?? 0) >= 10 ? "text-red-600" : undefined}
        loading={loading}
      />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {user.role === "ADMIN"
              ? "Here's a real-time overview of the platform."
              : "Here's an overview of your activity."}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
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

      {/* Role-based stats */}
      {user.role === "ADMIN" ? <AdminStats /> : <PersonalStats />}
    </div>
  );
}
