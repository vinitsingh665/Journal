export default function DashboardLoading() {
  return (
    <div className="flex-1 w-full p-8 flex flex-col gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-10 bg-surface rounded-lg w-1/4 mb-4 border border-border-secondary/30"></div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-surface rounded-2xl border border-border-secondary/30"></div>
        ))}
      </div>
      
      {/* Main Content Area Skeleton */}
      <div className="h-[500px] bg-surface rounded-2xl mt-4 w-full border border-border-secondary/30"></div>
    </div>
  );
}
