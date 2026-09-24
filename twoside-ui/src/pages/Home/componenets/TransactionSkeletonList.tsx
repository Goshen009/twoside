export function TransactionSkeletonList() {
  return (
    <div className="space-y-1">
      <div className="h-3 w-16 rounded bg-surface-hover animate-pulse mb-2 px-1" />
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-surface-hover animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 w-32 rounded bg-surface-hover animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-surface-hover animate-pulse" />
              </div>
            </div>
            <div className="h-3 w-16 rounded bg-surface-hover animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}