import Link from "next/link";
import { IThesis } from "../../types";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

interface ThesisCardProps {
  thesis: IThesis;
}

export default function ThesisCard({ thesis }: ThesisCardProps) {
  return (
    <Link
      href={`/thesis/${thesis.id}`}
      className="block rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-blue-200"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
          {thesis.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            STATUS_STYLES[thesis.status] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {thesis.status}
        </span>
      </div>

      {/* Meta */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
        {thesis.author?.name && (
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            {thesis.author.name}
          </span>
        )}
        {thesis.year && <span>{thesis.year}</span>}
        {thesis.course && (
          <span className="truncate max-w-[140px]">{thesis.course}</span>
        )}
      </div>

      {/* Abstract preview */}
      {thesis.abstract && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-500">
          {thesis.abstract}
        </p>
      )}

      {/* Tags */}
      {thesis.tags && thesis.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {thesis.tags.slice(0, 4).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
            >
              {tag.name}
            </span>
          ))}
          {thesis.tags.length > 4 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-400">
              +{thesis.tags.length - 4} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
