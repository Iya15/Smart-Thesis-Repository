"use client";

import { useState, useEffect, FormEvent } from "react";
import { AxiosError } from "axios";
import api from "../../lib/api";
import { IComment, Role } from "../../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_CHARS = 1000;

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-rose-100 text-rose-700",
  ADVISER: "bg-emerald-100 text-emerald-700",
  STUDENT: "bg-blue-100 text-blue-700",
};

// ─── Single comment row ───────────────────────────────────────────────────────

function CommentRow({ comment }: { comment: IComment }) {
  return (
    <div className="py-4 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-800">
          {comment.author?.name ?? "Unknown"}
        </span>
        {comment.author?.role && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              ROLE_STYLES[comment.author.role] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {comment.author.role}
          </span>
        )}
        <span className="ml-auto text-xs text-slate-400">
          {new Date(comment.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
        {comment.content}
      </p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CommentSectionProps {
  thesisId: string;
  userRole: Role;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommentSection({
  thesisId,
  userRole,
}: CommentSectionProps) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canComment = userRole === "ADMIN" || userRole === "ADVISER";
  const remaining = MAX_CHARS - content.length;

  // Fetch comments on mount
  useEffect(() => {
    api
      .get<{ data: IComment[] }>(`/api/comments/${thesisId}`)
      .then(({ data }) => setComments(data.data))
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));
  }, [thesisId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const { data } = await api.post<{ data: IComment }>(
        `/api/comments/${thesisId}`,
        { content: content.trim() }
      );
      // Prepend so newest-first order is preserved locally without a re-fetch
      setComments((prev) => [data.data, ...prev]);
      setContent("");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setErrorMsg(
        axiosErr.response?.data?.message ?? "Failed to post comment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-base font-semibold text-slate-900">Comments</h2>

      {/* ── Comment form (ADMIN / ADVISER only) ── */}
      {canComment && (
        <form onSubmit={handleSubmit} className="mt-4">
          {errorMsg && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-200">
              {errorMsg}
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CHARS}
            rows={3}
            disabled={submitting}
            placeholder="Leave feedback for the student…"
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
          />

          <div className="mt-2 flex items-center justify-between">
            {/* Character counter */}
            <span
              className={`text-xs ${
                remaining < 100 ? "text-amber-600" : "text-slate-400"
              }`}
            >
              {remaining} characters remaining
            </span>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {submitting ? "Posting…" : "Add Comment"}
            </button>
          </div>
        </form>
      )}

      {/* ── Divider between form and list ── */}
      {canComment && comments.length > 0 && (
        <hr className="my-4 border-slate-100" />
      )}

      {/* ── Comment list ── */}
      {loadingComments ? (
        <div className="mt-4 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse space-y-1.5">
              <div className="flex gap-2">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-4 w-14 rounded-full bg-slate-200" />
              </div>
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-3 w-3/4 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className={`text-sm text-slate-400 ${canComment ? "mt-2" : "mt-4"}`}>
          No feedback yet.
          {!canComment && " Adviser feedback will appear here."}
        </p>
      ) : (
        <div className="mt-4 divide-y divide-slate-100">
          {comments.map((comment) => (
            <CommentRow key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
