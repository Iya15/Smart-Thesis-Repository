"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useThesis } from "../../../../hooks/useThesis";
import FileUpload from "../../../../components/shared/FileUpload";
import { AxiosError } from "axios";

export default function UploadThesisPage() {
  const router = useRouter();
  const { uploadThesis } = useThesis();

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [year, setYear] = useState("");
  const [course, setCourse] = useState("");
  const [tags, setTags] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!pdfFile) {
      setErrorMsg("Please select a PDF file to upload.");
      return;
    }

    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("title", title.trim());
      if (abstract.trim()) formData.append("abstract", abstract.trim());
      if (year.trim()) formData.append("year", year.trim());
      if (course.trim()) formData.append("course", course.trim());
      if (tags.trim()) formData.append("tags", tags.trim());

      const thesis = await uploadThesis(formData);
      router.push(`/thesis/${thesis.id}`);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setErrorMsg(
        axiosErr.response?.data?.message ??
          "Upload failed. Please check your file and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Upload Thesis</h1>
        <p className="mt-1 text-sm text-slate-500">
          Submit your research paper. It will be reviewed before being published.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        {/* Error banner */}
        {errorMsg && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
            {errorMsg}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            placeholder="e.g. Machine Learning Approaches in Early Disease Detection"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
          />
        </div>

        {/* Abstract */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Abstract{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            disabled={loading}
            placeholder="Briefly describe the research problem, methodology, and findings…"
            className="mt-1 block w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
          />
        </div>

        {/* Year + Course (two columns) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Year{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={loading}
              placeholder={String(new Date().getFullYear())}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Course{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={loading}
              placeholder="e.g. BSIT"
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Tags{" "}
            <span className="text-slate-400 font-normal">
              (optional — comma separated)
            </span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            disabled={loading}
            placeholder="e.g. machine learning, healthcare, data mining"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            PDF File <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <FileUpload onFileSelect={(f) => setPdfFile(f)} disabled={loading} />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !pdfFile}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <svg
                className="h-4 w-4 animate-spin"
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
            {loading ? "Uploading…" : "Upload Thesis"}
          </button>
        </div>
      </form>
    </div>
  );
}
