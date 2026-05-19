import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="mx-auto max-w-2xl text-center">
        {/* Badge */}
        <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
          BSIT Academic Platform
        </span>

        {/* Heading */}
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
          Smart Thesis{" "}
          <span className="text-blue-600">Repository</span>
        </h1>

        {/* Sub-heading */}
        <p className="mt-4 text-lg text-slate-600">
          Upload, search, and analyze BSIT thesis papers with the power of AI.
          Summarize research, generate abstracts, and discover related studies —
          all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="w-full rounded-lg border border-slate-300 bg-white px-8 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="w-full rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
          >
            Register
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-sm text-slate-400">
          Free for all BSIT students · Powered by Google Gemini AI
        </p>
      </div>
    </main>
  );
}
