export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin`} />
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      <div className="h-4 bg-slate-700 rounded w-5/6"></div>
    </div>
  );
}

