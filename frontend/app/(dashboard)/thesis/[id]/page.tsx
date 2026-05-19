"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useThesis } from "../../../../hooks/useThesis";
import { useAuth } from "../../../../hooks/useAuth";
import ThesisDetail from "../../../../components/thesis/ThesisDetail";
import BookmarkButton from "../../../../components/thesis/BookmarkButton";
import CommentSection from "../../../../components/thesis/CommentSection";
import api from "../../../../lib/api";
import { IThesis } from "../../../../types";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded-md bg-slate-200" />
        <div className="h-8 w-20 rounded-lg bg-slate-200" />
      </div>
      <div className="rounded-xl bg-slate-200 p-6">
        <div className="flex justify-between gap-4">
          <div className="h-7 w-2/3 rounded-md bg-slate-300" />
          <div className="h-6 w-20 shrink-0 rounded-full bg-slate-300" />
        </div>
        <div className="mt-4 flex gap-4">
          <div className="h-4 w-24 rounded-md bg-slate-300" />
          <div className="h-4 w-12 rounded-md bg-slate-300" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-5 w-16 rounded-full bg-slate-300" />
          <div className="h-5 w-20 rounded-full bg-slate-300" />
        </div>
      </div>
      <div className="rounded-xl bg-slate-200 p-6">
        <div className="h-4 w-20 rounded-md bg-slate-300" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded-md bg-slate-300" />
          <div className="h-3 w-5/6 rounded-md bg-slate-300" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ThesisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getThesisById } = useThesis();
  const { user } = useAuth();

  const [thesis, setThesis] = useState<IThesis | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch thesis content
  useEffect(() => {
    if (!id) return;
    getThesisById(id)
      .then(setThesis)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch bookmark status once we know the thesis ID and the user is loaded
  useEffect(() => {
    if (!id || !user) return;
    api
      .get<{ data: { bookmarked: boolean } }>(`/api/bookmarks/${id}/status`)
      .then(({ data }) => setIsBookmarked(data.data.bookmarked))
      .catch(() => setIsBookmarked(false));
  }, [id, user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <DetailSkeleton />
      </div>
    );
  }

  if (notFound || !thesis) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
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
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
        <p className="mt-4 text-lg font-semibold text-slate-700">
          Thesis not found
        </p>
        <p className="mt-1 text-sm text-slate-400">
          It may have been removed or the link is incorrect.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* ThesisDetail — back button + all content sections (AI outputs included).
          The bookmarkSlot is rendered in the nav row next to the back button. */}
      <ThesisDetail
        thesis={thesis}
        bookmarkSlot={
          <BookmarkButton thesisId={thesis.id} initialState={isBookmarked} />
        }
      />

      {/* CommentSection — fetches live comments, allows ADMIN/ADVISER to post */}
      {user && (
        <CommentSection thesisId={thesis.id} userRole={user.role} />
      )}
    </div>
  );
}
