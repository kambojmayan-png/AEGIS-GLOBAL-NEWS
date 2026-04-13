'use client';

export function ArticleSkeleton() {
  return (
    <div className="p-4 rounded-lg glass space-y-3 animate-border-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/3" />
        </div>
        <div className="skeleton h-12 w-12 rounded-full shrink-0" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-5 w-16 rounded" />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {/* Country header skeleton */}
      <div className="space-y-2 mb-6">
        <div className="skeleton h-6 w-2/3" />
        <div className="skeleton h-4 w-1/2" />
      </div>
      {/* Article skeletons */}
      <ArticleSkeleton />
      <ArticleSkeleton />
      <ArticleSkeleton />
    </div>
  );
}

export function GlobeLoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#020617]">
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing ring animation */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-cyan-400/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full border border-cyan-400/40 animate-pulse-ring" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-cyan-400/60 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-cyan-400/80 font-mono text-sm tracking-widest uppercase animate-pulse">
            Initializing Globe
          </p>
          <p className="text-slate-500 text-xs">Loading geospatial data...</p>
        </div>
      </div>
    </div>
  );
}

export function AIProcessingIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
      <div className="flex gap-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-cyan-400/70 font-mono tracking-wider">AI Analyzing</span>
    </div>
  );
}
