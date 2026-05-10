import { SKELETON_ROW_COUNT_DIRECTORY } from "@/lib/constants"

export default function DirectoryLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="bg-bg-hover h-7 w-40 animate-pulse rounded-md" />
          <div className="bg-bg-hover mt-2 h-4 w-56 animate-pulse rounded-md" />
        </div>
        <div className="bg-bg-hover h-7 w-7 shrink-0 animate-pulse rounded-md" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: SKELETON_ROW_COUNT_DIRECTORY }).map((_, index) => (
          <div key={index} className="border-line bg-bg rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <span className="text-fg-faint w-5 shrink-0 text-right font-mono text-[11px] tabular-nums">
                {index + 1}
              </span>
              <div className="bg-bg-hover h-[38px] w-[38px] shrink-0 animate-pulse rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="bg-bg-hover h-3 w-32 animate-pulse rounded" />
                <div className="bg-bg-hover h-2.5 w-24 animate-pulse rounded" />
              </div>
              <div className="bg-bg-hover h-5 w-14 shrink-0 animate-pulse rounded-full" />
            </div>

            <div className="mt-3 pl-8">
              <div className="bg-bg-hover h-1 w-full animate-pulse rounded-full" />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 pl-8">
              <div className="bg-bg-hover h-1 w-full animate-pulse rounded-full" />
              <div className="bg-bg-hover h-1 w-full animate-pulse rounded-full" />
              <div className="bg-bg-hover h-1 w-full animate-pulse rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
