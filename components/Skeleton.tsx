'use client'

export function ShimmerBox({ className = '' }: { className?: string }) {
  return <div className={`shimmer ${className}`} />
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#e8edf2] px-4 py-3.5">
          <ShimmerBox className="h-3 w-24 mb-2.5" />
          <ShimmerBox className="h-7 w-16" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-[#e8edf2] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#eef1f4] flex items-center justify-between">
        <ShimmerBox className="h-4 w-40" />
        <ShimmerBox className="h-8 w-28" />
      </div>
      <div className="p-4 space-y-2.5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-3">
            {Array.from({ length: cols }).map((_, c) => (
              <ShimmerBox key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#e8edf2] p-5">
          <ShimmerBox className="h-4 w-32 mb-3" />
          <ShimmerBox className="h-3 w-full mb-2" />
          <ShimmerBox className="h-3 w-4/5 mb-2" />
          <ShimmerBox className="h-3 w-3/5" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div>
      <div className="mb-6">
        <ShimmerBox className="h-6 w-56 mb-2" />
        <ShimmerBox className="h-3.5 w-80" />
      </div>
      <SkeletonStatCards />
      <SkeletonTable />
    </div>
  )
}
