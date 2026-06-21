export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-700 rounded ${className}`} />
);

export const ProposalSkeleton = () => (
  <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 space-y-4">
    <div className="flex justify-between">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-6 w-16" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <div className="space-y-2 pt-2">
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-full" />
    </div>
  </div>
);

export const TeamSkeleton = () => (
  <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl p-6 space-y-3">
    <Skeleton className="h-6 w-1/2" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

export const StatSkeleton = () => (
  <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-10 w-20" />
    <Skeleton className="h-3 w-32" />
  </div>
);
