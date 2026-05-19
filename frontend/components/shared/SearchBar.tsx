"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const DEBOUNCE_MS = 400;

export default function SearchBar({
  onSearch,
  placeholder = "Search theses…",
  initialValue = "",
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external initialValue changes (e.g. URL param loads)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setValue(newVal);
    setPending(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(newVal.trim());
      setPending(false);
    }, DEBOUNCE_MS);
  };

  const handleClear = () => {
    setValue("");
    setPending(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    onSearch("");
  };

  return (
    <div className="relative flex items-center">
      {/* Left icon: spinner when debounce pending, search icon otherwise */}
      <span className="pointer-events-none absolute left-3 text-slate-400">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </span>

      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search"
        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />

      {/* Clear button */}
      {value && !pending && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 text-slate-400 transition hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
