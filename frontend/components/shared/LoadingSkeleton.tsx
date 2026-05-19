// animate-pulse loading skeletons for thesis cards, text blocks, and stat cards.

type Variant = "card" | "text" | "stat";

interface LoadingSkeletonProps {
  variant: Variant;
  count?: number;
}

// ─── Individual skeleton shapes ───────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-zinc-900 dark:ring-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-3/4 rounded-md bg-slate-200 dark:bg-zinc-700" />
        <div className="h-5 w-16 shrink-0 rounded-full bg-slate-200 dark:bg-zinc-700" />
      </div>
      <div className="mt-3 flex gap-3">
        <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-zinc-700" />
        <div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-zinc-700" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded-md bg-slate-200 dark:bg-zinc-700" />
        <div className="h-3 w-4/5 rounded-md bg-slate-200 dark:bg-zinc-700" />
      </div>
      <div className="mt-3 flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-slate-200 dark:bg-zinc-700" />
        <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-zinc-700" />
      </div>
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 w-full rounded-md bg-slate-200 dark:bg-zinc-700" />
      <div className="h-4 w-4/5 rounded-md bg-slate-200 dark:bg-zinc-700" />
      <div className="h-4 w-3/5 rounded-md bg-slate-200 dark:bg-zinc-700" />
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-zinc-900 dark:ring-zinc-700">
      <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-zinc-700" />
      <div className="mt-3 h-9 w-16 rounded-md bg-slate-200 dark:bg-zinc-700" />
      <div className="mt-2 h-3 w-32 rounded-md bg-slate-200 dark:bg-zinc-700" />
    </div>
  );
}

// ─── Grid wrappers per variant ────────────────────────────────────────────────

const GRIDS: Record<Variant, string> = {
  card: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
  text: "space-y-4",
  stat: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
};

const COMPONENTS: Record<Variant, () => React.ReactElement> = {
  card: () => <CardSkeleton />,
  text: () => <TextSkeleton />,
  stat: () => <StatSkeleton />,
};

// ─── Export ───────────────────────────────────────────────────────────────────

export default function LoadingSkeleton({
  variant,
  count = 1,
}: LoadingSkeletonProps) {
  const Skeleton = COMPONENTS[variant];
  const items = Array.from({ length: count });

  if (count === 1) return <Skeleton />;

  return (
    <div className={GRIDS[variant]}>
      {items.map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  );
}
