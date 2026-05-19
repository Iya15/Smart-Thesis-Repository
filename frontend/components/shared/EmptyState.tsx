import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
      {/* Icon */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
        {icon}
      </div>

      {/* Text */}
      <h3 className="mt-4 text-base font-semibold text-slate-700 dark:text-gray-200">
        {title}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-slate-400 dark:text-zinc-500">
        {description}
      </p>

      {/* Optional action */}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
