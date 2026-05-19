"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "../../../lib/api";
import ThesisCard from "../../../components/thesis/ThesisCard";
import { IThesis } from "../../../types";

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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
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
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
        />
      </svg>
      <h3 className="mt-4 text-base font-semibold text-slate-700">
        No saved theses yet
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        Bookmark any thesis to find it here later.
      </p>
      <Link
        href="/thesis"
        className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Browse Repository
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookmarksPage() {
  const [theses, setTheses] = useState<IThesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    api
      .get<{ data: IThesis[] }>("/api/bookmarks")
      .then(({ data }) => setTheses(data.data))
      .catch(() => setErrorMsg("Failed to load bookmarks. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">My Bookmarks</h1>
        {!loading && (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-semibold text-blue-700">
            {theses.length}
          </span>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
          {errorMsg}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && theses.length === 0 && !errorMsg && <EmptyState />}

      {/* Thesis grid */}
      {!loading && theses.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {theses.map((thesis) => (
            <ThesisCard key={thesis.id} thesis={thesis} />
          ))}
        </div>
      )}
    </div>
  );
}
