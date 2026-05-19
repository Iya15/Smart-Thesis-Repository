"use client";

import { useState } from "react";
import api from "../../lib/api";

interface BookmarkButtonProps {
  thesisId: string;
  initialState: boolean;
}

export default function BookmarkButton({
  thesisId,
  initialState,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialState);
  const [pending, setPending] = useState(false);

  const handleToggle = async () => {
    if (pending) return;

    // Optimistic update — toggle immediately without waiting for API
    const previous = bookmarked;
    setBookmarked(!bookmarked);
    setPending(true);

    try {
      await api.post(`/api/bookmarks/${thesisId}`);
    } catch {
      // Rollback to previous state on failure
      setBookmarked(previous);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      title={bookmarked ? "Saved" : "Save to bookmarks"}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
        bookmarked
          ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
          : "border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {/* Filled bookmark when saved, outline when not */}
      <svg
        className="h-4 w-4"
        fill={bookmarked ? "currentColor" : "none"}
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
      {bookmarked ? "Saved" : "Save"}
    </button>
  );
}
