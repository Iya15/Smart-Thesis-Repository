"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useThesis } from "../../../hooks/useThesis";
import { useAuth } from "../../../hooks/useAuth";
import ThesisCard from "../../../components/thesis/ThesisCard";
import SearchBar from "../../../components/shared/SearchBar";
import FilterBar from "../../../components/shared/FilterBar";
import { IThesis, PaginatedResponse } from "../../../types";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-3/4 rounded-md bg-slate-200" />
        <div className="h-5 w-16 shrink-0 rounded-full bg-slate-200" />
      </div>
      <div className="mt-3 flex gap-3">
        <div className="h-4 w-24 rounded-md bg-slate-200" />
        <div className="h-4 w-16 rounded-md bg-slate-200" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded-md bg-slate-200" />
        <div className="h-3 w-4/5 rounded-md bg-slate-200" />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
      <svg
        className="h-12 w-12 text-slate-300"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
      <h3 className="mt-4 text-base font-semibold text-slate-700">
        {hasFilters ? "No results found" : "No theses yet"}
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        {hasFilters
          ? "Try adjusting your search or filters."
          : "Be the first to contribute to the repository."}
      </p>
      {!hasFilters && (
        <Link
          href="/thesis/upload"
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Upload Thesis
        </Link>
      )}
    </div>
  );
}

// ─── Inner content (uses useSearchParams — must be inside Suspense) ───────────

function ThesisListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { getTheses } = useThesis();
  const { user } = useAuth();

  const [result, setResult] = useState<PaginatedResponse<IThesis> | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Derive all state from URL — single source of truth
  const search = searchParams.get("search") ?? "";
  const year = searchParams.get("year") ?? "";
  const course = searchParams.get("course") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  // Push updated params to URL, always reset to page 1 unless explicitly provided
  const updateParams = useCallback(
    (updates: Record<string, string>, keepPage = false) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, val]) => {
        if (val && val !== "ALL" && val !== "0") {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      });

      if (!keepPage) params.delete("page");

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [searchParams, router, pathname]
  );

  const handleSearch = (term: string) => updateParams({ search: term });

  const handleFilterChange = (
    updated: Partial<{ year: string; course: string; status: string }>
  ) => updateParams(updated as Record<string, string>);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) params.set("page", String(newPage));
    else params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchTheses = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getTheses({
        page,
        limit: 9,
        search: search || undefined,
        year: year ? Number(year) : undefined,
        course: course || undefined,
        status: status || undefined,
      });
      setResult(data);
    } catch {
      setErrorMsg("Failed to load theses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchParams.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchTheses();
  }, [fetchTheses]);

  const isAdmin = user?.role === "ADMIN";
  const hasFilters = Boolean(search || year || course || status);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thesis Repository</h1>
          {!loading && result && (
            <p className="mt-0.5 text-sm text-slate-500">
              Showing {result.data.length} of {result.total}{" "}
              {result.total === 1 ? "result" : "results"}
            </p>
          )}
        </div>
        <Link
          href="/thesis/upload"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload Thesis
        </Link>
      </div>

      {/* Search */}
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search by title, abstract, or content…"
        initialValue={search}
      />

      {/* Filters */}
      <FilterBar
        filters={{ year, course, status: status || "ALL" }}
        onChange={handleFilterChange}
        showStatusFilter={isAdmin}
      />

      {/* Error */}
      {errorMsg && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
          {errorMsg}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <>
          {result.data.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {result.data.map((thesis) => (
                <ThesisCard key={thesis.id} thesis={thesis} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {result.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === result.totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Page (wraps content in Suspense for useSearchParams) ────────────────────

export default function ThesisListPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      }
    >
      <ThesisListContent />
    </Suspense>
  );
}
