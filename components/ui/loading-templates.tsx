import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const MarketplaceLoadingTemplate = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    {/* Header Skeleton */}
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-6" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Collections Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="group">
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
              <Skeleton className="w-full h-full" />
            </div>
            <CardContent className="p-6 space-y-4">
              <div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
)

export const CollectionLoadingTemplate = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    {/* Header Skeleton */}
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="container mx-auto px-4 py-8">
      {/* Collection Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-4 w-96 mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* NFTs Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="group">
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
              <Skeleton className="w-full h-full" />
            </div>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
)

export const CreatePageLoadingTemplate = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    {/* Header Skeleton */}
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="container mx-auto px-4 py-8">
      {/* Back Button Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Form Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)

export const SimpleLoadingTemplate = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
)
