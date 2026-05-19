"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import AiToolPanel from "../../../components/ai/AiToolPanel";
import AiOutput from "../../../components/ai/AiOutput";
import api from "../../../lib/api";
import { IThesis, IAiOutput, AiType } from "../../../types";

// ─── Tool type order for display ──────────────────────────────────────────────

const TOOL_TYPES: AiType[] = [
  "SUMMARY",
  "ABSTRACT",
  "TITLE_SUGGESTION",
  "CITATION",
  "RELATED_STUDIES",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AiToolsPage() {
  const { user } = useAuth();

  const [theses, setTheses] = useState<IThesis[]>([]);
  const [selectedThesisId, setSelectedThesisId] = useState<string>("");
  const [outputs, setOutputs] = useState<Partial<Record<AiType, IAiOutput>>>({});
  const [loadingType, setLoadingType] = useState<AiType | null>(null);
  const [loadingTheses, setLoadingTheses] = useState(true);
  const [loadingOutputs, setLoadingOutputs] = useState(false);

  // ── Fetch user's own theses (all statuses) for the selector ──────────────
  useEffect(() => {
    api
      .get<{ data: IThesis[] }>("/api/theses/mine")
      .then(({ data }) => setTheses(data.data))
      .catch(() => setTheses([]))
      .finally(() => setLoadingTheses(false));
  }, []);

  // ── Fetch saved AI outputs when thesis selection changes ──────────────────
  const fetchOutputs = useCallback(async (thesisId: string) => {
    setLoadingOutputs(true);
    setOutputs({});
    try {
      const { data } = await api.get<{ data: IAiOutput[] }>(
        `/api/ai/outputs/${thesisId}`
      );
      const map: Partial<Record<AiType, IAiOutput>> = {};
      data.data.forEach((o) => { map[o.type] = o; });
      setOutputs(map);
    } catch {
      // Silent — outputs stay empty
    } finally {
      setLoadingOutputs(false);
    }
  }, []);

  const handleThesisChange = (id: string) => {
    setSelectedThesisId(id);
    setOutputs({});
    setLoadingType(null);
    if (id) fetchOutputs(id);
  };

  const handleOutputGenerated = (output: IAiOutput) => {
    setOutputs((prev) => ({ ...prev, [output.type]: output }));
  };

  const selectedThesis = theses.find((t) => t.id === selectedThesisId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Research Tools</h1>
        <p className="mt-1 text-sm text-slate-500">
          Powered by Google Gemini. Generate summaries, abstracts, citations,
          and more from your uploaded thesis papers.
        </p>
      </div>

      {/* ── Warning banner ── */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
        <svg
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <p className="text-sm text-amber-700">
          AI tools are limited to{" "}
          <strong>10 requests per day</strong> per account. Results are saved
          automatically — revisiting a thesis will load your previous outputs
          without consuming your quota.
        </p>
      </div>

      {/* ── Thesis selector ── */}
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <label
          htmlFor="thesis-select"
          className="block text-sm font-medium text-slate-700"
        >
          Select a thesis to analyze
        </label>

        {loadingTheses ? (
          <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-slate-200" />
        ) : theses.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            You have no uploaded theses yet.{" "}
            <a href="/thesis/upload" className="font-medium text-blue-600 hover:underline">
              Upload one first.
            </a>
          </p>
        ) : (
          <select
            id="thesis-select"
            value={selectedThesisId}
            onChange={(e) => handleThesisChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">— Select a thesis —</option>
            {theses.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}{" "}
                {t.year ? `(${t.year})` : ""}
                {t.status !== "APPROVED" ? ` [${t.status}]` : ""}
              </option>
            ))}
          </select>
        )}

        {/* Selected thesis info */}
        {selectedThesis && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {selectedThesis.author?.name && (
              <span>By {selectedThesis.author.name}</span>
            )}
            {selectedThesis.course && <span>{selectedThesis.course}</span>}
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                selectedThesis.status === "APPROVED"
                  ? "bg-green-100 text-green-700"
                  : selectedThesis.status === "PENDING"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {selectedThesis.status}
            </span>
            {!selectedThesis.extractedText && (
              <span className="text-amber-600">
                ⚠ No extracted text — some tools may be unavailable
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── AI Tools Panel (shown after thesis selection) ── */}
      {selectedThesisId && (
        <>
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <AiToolPanel
              thesisId={selectedThesisId}
              onOutputGenerated={handleOutputGenerated}
              onLoadingChange={setLoadingType}
            />
          </div>

          {/* ── Output sections ── */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-800">
              Generated Outputs
            </h2>

            {TOOL_TYPES.map((type) => (
              <div key={type} id={`output-${type}`}>
                <AiOutput
                  output={outputs[type] ?? null}
                  type={type}
                  loading={
                    loadingOutputs
                      ? false // Don't show per-type loading during initial fetch
                      : loadingType === type
                  }
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
