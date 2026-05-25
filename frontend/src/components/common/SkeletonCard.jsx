export default function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 skeleton rounded-full flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton rounded w-3/4" />
          <div className="h-3 skeleton rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 skeleton rounded-full w-16" />
        <div className="h-5 skeleton rounded-full w-20" />
      </div>
      <div className="flex justify-between pt-2 border-t border-surface-100 dark:border-surface-800">
        <div className="h-4 skeleton rounded w-20" />
        <div className="h-4 skeleton rounded w-16" />
      </div>
    </div>
  );
}
