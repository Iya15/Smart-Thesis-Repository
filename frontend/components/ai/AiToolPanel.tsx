"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import api from "../../lib/api";
import { IAiOutput, AiType } from "../../types";
import { AxiosError } from "axios";

// ─── Tool config ──────────────────────────────────────────────────────────────

interface AiTool {
  type: AiType;
  label: string;
  description: string;
  endpoint: (thesisId: string) => string;
  icon: React.ReactNode;
}

const AI_TOOLS: AiTool[] = [
  {
    type: "SUMMARY",
    label: "Summarize",
    description: "3-paragraph academic summary covering problem, methods, and findings",
    endpoint: (id) => `/api/ai/summarize/${id}`,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    ),
  },
  {
    type: "ABSTRACT",
    label: "Generate Abstract",
    description: "Formal 150–250 word abstract with structured academic sections",
    endpoint: (id) => `/api/ai/abstract/${id}`,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    type: "TITLE_SUGGESTION",
    label: "Suggest Titles",
    description: "5 alternative academic title suggestions under 15 words each",
    endpoint: (id) => `/api/ai/titles/${id}`,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    ),
  },
  {
    type: "CITATION",
    label: "Format Citation",
    description: "APA 7th edition citation for an unpublished thesis",
    endpoint: (id) => `/api/ai/citation/${id}`,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    type: "RELATED_STUDIES",
    label: "Related Studies",
    description: "5 related research topics with relevance explanations",
    endpoint: (id) => `/api/ai/related/${id}`,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AiToolPanelProps {
  thesisId: string;
  onOutputGenerated: (output: IAiOutput) => void;
  onLoadingChange?: (type: AiType | null) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AiToolPanel({
  thesisId,
  onOutputGenerated,
  onLoadingChange,
}: AiToolPanelProps) {
  const [loadingTool, setLoadingTool] = useState<AiType | null>(null);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch today's usage count on mount and when thesisId changes
  useEffect(() => {
    api
      .get<{ data: { count: number } }>("/api/ai/usage")
      .then(({ data }) => setUsageCount(data.data.count))
      .catch(() => {}); // silent — counter shows 0 if fetch fails
  }, []);

  const setLoading = (tool: AiType | null) => {
    setLoadingTool(tool);
    onLoadingChange?.(tool);
  };

  const handleRun = async (tool: AiTool) => {
    if (loadingTool || usageCount >= 10) return;
    setErrorMsg("");
    setLoading(tool.type);

    try {
      const { data } = await api.post<{ data: IAiOutput }>(
        tool.endpoint(thesisId)
      );
      onOutputGenerated(data.data);
      setUsageCount((c) => c + 1);

      // Scroll to the output area
      document
        .getElementById(`output-${tool.type}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string }>;
      const status = axiosErr.response?.status;
      if (status === 429) {
        setErrorMsg(
          "Daily AI limit reached (10/day). Try again tomorrow."
        );
        setUsageCount(10);
      } else if (status === 422) {
        setErrorMsg(
          "This thesis has no extracted text available. Ensure the PDF was processed correctly."
        );
      } else {
        setErrorMsg(
          axiosErr.response?.data?.message ?? "AI generation failed. Please try again."
        );
      }
    } finally {
      setLoading(null);
    }
  };

  const limitReached = usageCount >= 10;

  return (
    <div className="space-y-4">
      {/* Usage counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">AI Research Tools</p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${
                limitReached ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min((usageCount / 10) * 100, 100)}%` }}
            />
          </div>
          <span
            className={`text-xs font-semibold ${
              limitReached ? "text-red-600" : "text-slate-500"
            }`}
          >
            {usageCount} / 10 today
          </span>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
          {errorMsg}
        </div>
      )}

      {/* Limit reached banner */}
      {limitReached && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
          Daily limit reached. AI tools reset at midnight.
        </div>
      )}

      {/* Tool grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AI_TOOLS.map((tool) => {
          const isRunning = loadingTool === tool.type;
          const isDisabled = Boolean(loadingTool) || limitReached;

          return (
            <button
              key={tool.type}
              type="button"
              onClick={() => handleRun(tool)}
              disabled={isDisabled}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                isDisabled
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
              }`}
            >
              <span
                className={`mt-0.5 shrink-0 ${
                  isRunning ? "text-blue-600" : "text-slate-500"
                }`}
              >
                {isRunning ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  tool.icon
                )}
              </span>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    isRunning ? "text-blue-700" : "text-slate-800"
                  }`}
                >
                  {tool.label}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-slate-500">
                  {tool.description}
                </p>
                {isRunning && (
                  <p className="mt-1 text-xs font-medium text-blue-600">
                    Generating…
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
