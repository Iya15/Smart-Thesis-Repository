"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../hooks/useAuth";
import api from "../../../../lib/api";
import { IAdminUser, PaginatedResponse, Role } from "../../../../types";
import { AxiosError } from "axios";

// ─── Role badge ───────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<Role, string> = {
  STUDENT: "bg-blue-100 text-blue-700",
  ADMIN: "bg-purple-100 text-purple-700",
  ADVISER: "bg-amber-100 text-amber-700",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [result, setResult] = useState<PaginatedResponse<IAdminUser> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Guard: redirect non-admins
  useEffect(() => {
    if (!authLoading && user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data } = await api.get<{
        data: PaginatedResponse<IAdminUser>;
      }>(`/api/admin/users?page=${page}&limit=10`);
      setResult(data.data);
    } catch {
      setErrorMsg("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (user?.role === "ADMIN") fetchUsers();
  }, [user, fetchUsers]);

  const handleDelete = async (target: IAdminUser) => {
    if (!window.confirm(`Delete user "${target.name}"? This action cannot be undone.`))
      return;

    setDeletingId(target.id);
    setErrorMsg("");
    try {
      await api.delete(`/api/admin/users/${target.id}`);
      // Remove from local state instead of re-fetching
      setResult((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.filter((u) => u.id !== target.id),
              total: prev.total - 1,
            }
          : prev
      );
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setErrorMsg(
        axiosErr.response?.data?.message ?? "Failed to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (target: IAdminUser): boolean => {
    if (!user) return false;
    if (target.id === user.id) return false; // can't delete self
    if (target.role === "ADMIN") return false; // can't delete other admins
    return true;
  };

  const deleteTooltip = (target: IAdminUser): string => {
    if (target.id === user?.id) return "You cannot delete your own account";
    if (target.role === "ADMIN") return "Admin accounts cannot be deleted";
    return "Delete user";
  };

  if (authLoading || !user) return null;
  if (user.role !== "ADMIN") return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage all registered users
          {result && (
            <span className="ml-2 font-medium text-slate-700">
              ({result.total} total)
            </span>
          )}
        </p>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
          {errorMsg}
        </div>
      )}

      {/* Table card */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : !result || result.data.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Theses</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.data.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {u.name}
                      {u.id === user.id && (
                        <span className="ml-2 text-xs text-slate-400">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          ROLE_STYLES[u.role] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {u._count.theses}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={!canDelete(u) || deletingId === u.id}
                        title={deleteTooltip(u)}
                        className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                          canDelete(u)
                            ? "bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
                            : "cursor-not-allowed bg-slate-100 text-slate-400"
                        }`}
                      >
                        {deletingId === u.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {result && result.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
            <p className="text-sm text-slate-500">
              Page {page} of {result.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(result.totalPages, p + 1))
                }
                disabled={page === result.totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
