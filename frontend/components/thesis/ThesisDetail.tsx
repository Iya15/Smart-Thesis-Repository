"use client";

import { useState } from "react";
import Link from "next/link";
import { IThesis } from "../../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const AI_TYPE_LABELS: Record<string, string> = {
  SUMMARY: "Summary",
  ABSTRACT: "Abstract",
  TITLE_SUGGESTION: "Title Suggestion",
  CITATION: "Citation",
  RELATED_STUDIES: "Related Studies",
};

const EXTRACTED_PREVIEW_LENGTH = 500;

// ─── Section Card ─────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ThesisDetail({
  thesis,
  bookmarkSlot,
}: {
  thesis: IThesis;
  bookmarkSlot?: React.ReactNode;
}) {
  const [showFullText, setShowFullText] = useState(false);
  const hasMoreText =
    (thesis.extractedText?.length ?? 0) > EXTRACTED_PREVIEW_LENGTH;

  const displayedText =
    showFullText || !hasMoreText
      ? thesis.extractedText
      : thesis.extractedText?.substring(0, EXTRACTED_PREVIEW_LENGTH) + "…";

  return (
    <div className="space-y-5">
      {/* ── Navigation row: back button + optional bookmark slot ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/thesis"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Back to Repository
        </Link>
        {bookmarkSlot}
      </div>

      {/* ── Header card ── */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold leading-snug text-slate-900">
            {thesis.title}
          </h1>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              STATUS_STYLES[thesis.status] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {thesis.status}
          </span>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          {thesis.author?.name && (
            <span className="flex items-center gap-1.5">
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
          {thesis.course && <span>{thesis.course}</span>}
          <span>
            {new Date(thesis.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Tags */}
        {thesis.tags && thesis.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {thesis.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Abstract ── */}
      {thesis.abstract && (
        <Section title="Abstract">
          <p className="text-sm leading-relaxed text-slate-600">
            {thesis.abstract}
          </p>
        </Section>
      )}

      {/* ── File ── */}
      <Section title="Document">
        <a
          href={thesis.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          View / Download PDF
        </a>
        <p className="mt-2 text-xs text-slate-400">Opens in a new tab</p>
      </Section>

      {/* ── Extracted Text Preview ── */}
      {thesis.extractedText && (
        <Section title="Extracted Text Preview">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-600">
              {displayedText}
            </p>
          </div>
          {hasMoreText && (
            <button
              type="button"
              onClick={() => setShowFullText((v) => !v)}
              className="mt-2 text-sm font-medium text-blue-600 transition hover:underline"
            >
              {showFullText ? "Show less" : "Show more"}
            </button>
          )}
        </Section>
      )}

      {/* ── AI Outputs ── */}
      <Section title="AI Analysis">
        {thesis.aiOutputs && thesis.aiOutputs.length > 0 ? (
          <div className="space-y-4">
            {thesis.aiOutputs.map((output) => (
              <div key={output.id}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {AI_TYPE_LABELS[output.type] ?? output.type}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {output.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            No AI analysis yet —{" "}
            <Link
              href={`/ai-tools?thesis=${thesis.id}`}
              className="font-medium text-blue-600 hover:underline"
            >
              use AI Tools
            </Link>{" "}
            to generate a summary, abstract, or citations.
          </p>
        )}
      </Section>

    </div>
  );
}
