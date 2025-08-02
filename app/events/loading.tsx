import { Skeleton } from "@/components/ui/skeleton"

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-96 mx-auto mb-4" />
        <Skeleton className="h-6 w-2/3 mx-auto" />
      </div>

      <Skeleton className="h-24 w-full rounded-lg mb-12" />

      <div className="mb-16">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-lg" />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[350px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
