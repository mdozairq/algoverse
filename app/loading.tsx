export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 p-8">
      {/* Header Skeleton */}
      <header className="border-b border-gray-700 bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
            <div className="hidden md:flex items-center space-x-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 w-20 bg-gray-700 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <section className="py-32 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="h-24 w-96 bg-gray-800 rounded mx-auto animate-pulse"></div>
              <div className="h-24 w-80 bg-gray-800 rounded mx-auto animate-pulse"></div>
              <div className="h-16 w-64 bg-gray-700 rounded mx-auto animate-pulse"></div>
            </div>
            <div className="mt-16">
              <div className="h-12 w-48 bg-gray-800 rounded-full mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Skeleton */}
      <section className="py-24 px-6 bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="h-12 w-80 bg-gray-700 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 bg-gray-700 rounded mx-auto animate-pulse"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                <div className="aspect-[4/3] bg-gray-600 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 w-3/4 bg-gray-600 rounded mb-2 animate-pulse"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 w-full bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-20 bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section Skeleton */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="h-16 w-80 bg-gray-800 rounded mb-8 animate-pulse"></div>
              <div className="space-y-4 mb-8">
                <div className="h-4 w-full bg-gray-800 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-gray-800 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-gray-800 rounded-full mt-3 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-800 rounded mb-1 animate-pulse"></div>
                      <div className="h-4 w-48 bg-gray-800 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="aspect-square bg-gray-800 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Footer Skeleton */}
      <footer className="py-16 px-6 border-t border-gray-700 bg-gray-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-6 w-24 bg-gray-700 rounded mb-4 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
