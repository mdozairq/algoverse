import { Skeleton } from "@/components/ui/skeleton"

export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header Skeleton */}
      <header className="border-b border-gray-700 bg-gray-800 dark:bg-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-16 w-96 bg-gray-800 rounded mx-auto mb-4 animate-pulse" />
          <Skeleton className="h-6 w-128 bg-gray-800 rounded mx-auto animate-pulse" />
        </div>

        {/* Search Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <Skeleton className="h-10 bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-32 bg-gray-800 rounded animate-pulse" />
              <Skeleton className="h-10 w-20 bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <Skeleton className="h-32 w-full rounded-lg mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
