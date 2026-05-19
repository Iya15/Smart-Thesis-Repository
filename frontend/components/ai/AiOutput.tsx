"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { IAiOutput, AiType } from "../../types";

const AI_TYPE_LABELS: Record<AiType, string> = {
  SUMMARY: "Summary",
  ABSTRACT: "Abstract",
  TITLE_SUGGESTION: "Title Suggestions",
  CITATION: "APA Citation",
  RELATED_STUDIES: "Related Studies",
};

interface AiOutputProps {
  output: IAiOutput | null;
  type: AiType;
  loading: boolean;
}

export default function AiOutput({ output, type, loading }: AiOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!output?.content) return;
    try {
      await navigator.clipboard.writeText(output.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be blocked in non-secure contexts
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {AI_TYPE_LABELS[type]}
          </span>
          <div className="h-3.5 w-16 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="space-y-2.5">
          <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-3.5 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="h-3.5 w-4/6 animate-pulse rounded bg-slate-200" />
          <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-200" />
        </div>
        <p className="mt-3 text-xs text-blue-500">Generating with Gemini AI…</p>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!output) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
        <div className="rounded-full bg-slate-100 p-3">
          <svg
            className="h-5 w-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
            />
          </svg>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-600">
          {AI_TYPE_LABELS[type]}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          Run the tool above to generate output.
        </p>
      </div>
    );
  }

  // ── Output ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {AI_TYPE_LABELS[type]}
          </span>
          <p className="text-xs text-slate-400">
            Generated on{" "}
            {new Date(output.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Content */}
      <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {output.content}
      </div>
    </div>
  );
}
