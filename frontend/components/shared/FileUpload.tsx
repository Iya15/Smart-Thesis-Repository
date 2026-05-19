"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (file.type !== "application/pdf") return "Only PDF files are accepted.";
    if (file.size > MAX_SIZE_BYTES)
      return `File must not exceed ${MAX_SIZE_MB} MB (got ${formatBytes(file.size)}).`;
    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validate(file);
    if (validationError) {
      setErrorMsg(validationError);
      setSelectedFile(null);
      return;
    }
    setErrorMsg("");
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload PDF file"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
            : dragging
            ? "border-blue-500 bg-blue-50"
            : selectedFile
            ? "border-green-400 bg-green-50"
            : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        {/* Icon */}
        <svg
          className={`h-10 w-10 ${
            selectedFile ? "text-green-500" : "text-slate-400"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>

        {selectedFile ? (
          <div className="mt-3 text-center">
            <p className="text-sm font-medium text-green-700">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">{formatBytes(selectedFile.size)}</p>
            <p className="mt-1 text-xs text-slate-400">Click to replace</p>
          </div>
        ) : (
          <div className="mt-3 text-center">
            <p className="text-sm font-medium text-slate-700">
              {dragging ? "Drop your PDF here" : "Drag & drop or click to upload"}
            </p>
            <p className="mt-1 text-xs text-slate-400">PDF only · max {MAX_SIZE_MB} MB</p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Validation error */}
      {errorMsg && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
