"use client";

import { ThesisFilters } from "../../types";

interface FilterBarProps {
  filters: Omit<ThesisFilters, "search" | "page">;
  onChange: (updated: Partial<Omit<ThesisFilters, "search" | "page">>) => void;
  showStatusFilter?: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 2017 },
  (_, i) => CURRENT_YEAR - i
);

const COURSE_OPTIONS = ["BSIT", "BSCS", "BSIS"];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
];

const hasActiveFilters = (
  filters: Omit<ThesisFilters, "search" | "page">
): boolean =>
  Boolean(filters.year || filters.course || (filters.status && filters.status !== "ALL"));

export default function FilterBar({
  filters,
  onChange,
  showStatusFilter = false,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Year filter */}
      <div className="flex items-center gap-1.5">
        <label
          htmlFor="filter-year"
          className="text-xs font-medium text-slate-500"
        >
          Year
        </label>
        <select
          id="filter-year"
          value={filters.year ?? ""}
          onChange={(e) => onChange({ year: e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All years</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Course filter */}
      <div className="flex items-center gap-1.5">
        <label
          htmlFor="filter-course"
          className="text-xs font-medium text-slate-500"
        >
          Course
        </label>
        <select
          id="filter-course"
          value={filters.course ?? ""}
          onChange={(e) => onChange({ course: e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All courses</option>
          {COURSE_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Status filter (admin only) */}
      {showStatusFilter && (
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="filter-status"
            className="text-xs font-medium text-slate-500"
          >
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status ?? "ALL"}
            onChange={(e) => onChange({ status: e.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear filters */}
      {hasActiveFilters(filters) && (
        <button
          type="button"
          onClick={() => onChange({ year: "", course: "", status: "ALL" })}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
