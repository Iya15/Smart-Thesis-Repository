"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useThesis } from "../../../hooks/useThesis";
import { useAuth } from "../../../hooks/useAuth";
import ThesisCard from "../../../components/thesis/ThesisCard";
import SearchBar from "../../../components/shared/SearchBar";
import FilterBar from "../../../components/shared/FilterBar";
import LoadingSkeleton from "../../../components/shared/LoadingSkeleton";
import EmptyState from "../../../components/shared/EmptyState";
import ErrorBanner from "../../../components/shared/ErrorBanner";
import { IThesis, PaginatedResponse } from "../../../types";

// ─── Document icon for empty state ───────────────────────────────────────────

const DocIcon = (
  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

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

  const search = searchParams.get("search") ?? "";
  const year = searchParams.get("year") ?? "";
  const course = searchParams.get("course") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const updateParams = useCallback(
    (updates: Record<string, string>, keepPage = false) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val && val !== "ALL" && val !== "0") params.set(key, val);
        else params.delete(key);
      });
      if (!keepPage) params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [searchParams, router, pathname]
  );

  const handleSearch = (term: string) => updateParams({ search: term });
  const handleFilterChange = (updated: Partial<{ year: string; course: string; status: string }>) =>
    updateParams(updated as Record<string, string>);
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
      setErrorMsg("Failed to load theses. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [searchParams.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchTheses(); }, [fetchTheses]);

  const isAdmin = user?.role === "ADMIN";
  const hasFilters = Boolean(search || year || course || status);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
            Thesis Repository
          </h1>
          {!loading && result && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
              Showing {result.data.length} of {result.total}{" "}
              {result.total === 1 ? "result" : "results"}
            </p>
          )}
        </div>
        <Link
          href="/thesis/upload"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload Thesis
        </Link>
      </div>

      <SearchBar
        onSearch={handleSearch}
        placeholder="Search by title, abstract, or content…"
        initialValue={search}
      />

      <FilterBar
        filters={{ year, course, status: status || "ALL" }}
        onChange={handleFilterChange}
        showStatusFilter={isAdmin}
      />

      {/* Error */}
      {errorMsg && (
        <ErrorBanner message={errorMsg} onRetry={fetchTheses} />
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton variant="card" count={6} />}

      {/* Results */}
      {!loading && result && (
        <>
          {result.data.length === 0 ? (
            <EmptyState
              icon={DocIcon}
              title={hasFilters ? "No results found" : "No theses yet"}
              description={
                hasFilters
                  ? "Try adjusting your search or clearing the filters."
                  : "Be the first to contribute to the repository."
              }
              actionLabel={hasFilters ? undefined : "Upload Thesis"}
              actionHref={hasFilters ? undefined : "/thesis/upload"}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {result.data.map((thesis) => (
                <ThesisCard key={thesis.id} thesis={thesis} />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500 dark:text-zinc-400">
                Page {page} of {result.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === result.totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ThesisListPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-700" />
          <LoadingSkeleton variant="card" count={6} />
        </div>
      }
    >
      <ThesisListContent />
    </Suspense>
  );
}
