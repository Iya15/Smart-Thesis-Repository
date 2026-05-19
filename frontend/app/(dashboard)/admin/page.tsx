"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../lib/api";
import { AdminStats, IThesis, PaginatedResponse } from "../../../types";
import { AxiosError } from "axios";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ?? "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<IThesis[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [actionError, setActionError] = useState("");

  // Redirect non-admins immediately
  useEffect(() => {
    if (!authLoading && user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get<{ data: AdminStats }>("/api/admin/stats"),
        api.get<{ data: PaginatedResponse<IThesis> }>(
          "/api/admin/theses?status=PENDING&limit=10&page=1"
        ),
      ]);
      setStats(statsRes.data.data);
      setPending(pendingRes.data.data.data);
    } catch {
      // Silent — UI shows "—" placeholders
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") fetchData();
  }, [user, fetchData]);

  const handleStatusChange = async (
    thesisId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setActionError("");
    // Optimistic: remove from pending list immediately
    setPending((prev) => prev.filter((t) => t.id !== thesisId));

    try {
      await api.patch(`/api/theses/${thesisId}/status`, { status });
      // Refresh stats count
      const { data } = await api.get<{ data: AdminStats }>("/api/admin/stats");
      setStats(data.data);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setActionError(
        axiosErr.response?.data?.message ?? "Failed to update thesis status."
      );
      // Restore by re-fetching
      fetchData();
    }
  };

  if (authLoading || !user) return null;
  if (user.role !== "ADMIN") return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Platform statistics and pending submissions
          </p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Manage Users →
        </Link>
      </div>

      {/* Stats grid */}
      {loadingStats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total Users" value={stats?.totalUsers ?? "—"} />
          <StatCard label="Total Theses" value={stats?.totalTheses ?? "—"} />
          <StatCard
            label="Pending Approval"
            value={stats?.pendingTheses ?? "—"}
            accent={
              (stats?.pendingTheses ?? 0) > 0
                ? "text-amber-600"
                : "text-slate-900"
            }
          />
          <StatCard
            label="Approved"
            value={stats?.approvedTheses ?? "—"}
            accent="text-green-600"
          />
          <StatCard
            label="AI Requests"
            value={stats?.totalAiRequests ?? "—"}
          />
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
          {actionError}
        </div>
      )}

      {/* Pending theses table */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Pending Submissions
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Review and approve or reject student thesis uploads
          </p>
        </div>

        {loadingStats ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <svg
              className="h-10 w-10 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-slate-600">
              All caught up!
            </p>
            <p className="text-xs text-slate-400">No pending submissions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3">Title</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pending.map((thesis) => (
                  <tr key={thesis.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/thesis/${thesis.id}`}
                        className="max-w-[240px] truncate font-medium text-slate-800 hover:text-blue-600 hover:underline"
                        title={thesis.title}
                      >
                        {thesis.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {thesis.author?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {thesis.year ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {thesis.course ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(thesis.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(thesis.id, "APPROVED")
                          }
                          className="rounded-md bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(thesis.id, "REJECTED")
                          }
                          className="rounded-md bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
