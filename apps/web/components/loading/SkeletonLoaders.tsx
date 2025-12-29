'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Shimmer effect component
export const ShimmerEffect: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("relative overflow-hidden", className)}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

// Card skeleton loader
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-3 p-6 border rounded-lg", className)}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-4/6" />
    </div>
    <div className="flex space-x-2 pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

// Tool page skeleton
export const ToolPageSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    {/* Header */}
    <div className="text-center space-y-4">
      <Skeleton className="h-12 w-3/4 mx-auto" />
      <Skeleton className="h-6 w-1/2 mx-auto" />
    </div>
    
    {/* Main content */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <CardSkeleton />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="space-y-6">
        <CardSkeleton />
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8">
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 border rounded-lg space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="p-6 border rounded-lg space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="border rounded-lg overflow-hidden">
    {/* Header */}
    <div className="border-b bg-muted/50 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="border-b last:border-b-0 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// List skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

// Form skeleton
export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex space-x-4 pt-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

// Page loading overlay
export const PageLoadingOverlay: React.FC<{ 
  isVisible: boolean;
  progress?: number;
  message?: string;
}> = ({ isVisible, progress, message = "Cargando..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg shadow-lg border max-w-sm w-full mx-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">{message}</p>
          {progress !== undefined && (
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};