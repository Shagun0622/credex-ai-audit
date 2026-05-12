// components/LoadingSkeleton.tsx
export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] font-sans">
      {/* Header Skeleton */}
      <div className="border-b border-[#E2E0DB] bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-12 p-8 rounded-2xl bg-gray-100">
          <div className="w-32 h-4 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="w-48 h-12 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
          <div className="w-40 h-8 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="w-64 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>

        {/* Benchmark Skeleton */}
        <div className="mb-8 bg-white border border-[#E2E0DB] rounded-xl p-6">
          <div className="w-48 h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-16 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Per-Tool Breakdown Skeleton */}
        <div className="mb-8">
          <div className="w-48 h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-[#E2E0DB] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-24 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-12 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary Skeleton */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="w-32 h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Capture Skeleton */}
        <div className="bg-white border border-[#E2E0DB] rounded-xl p-6">
          <div className="text-center">
            <div className="w-32 h-6 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
            <div className="w-48 h-12 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}