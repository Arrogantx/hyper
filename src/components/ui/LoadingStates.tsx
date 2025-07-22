'use client';

import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

// Generic loading overlay
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ isLoading, children, message = 'Loading...', className = '' }: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl"
        >
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-white text-sm">{message}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Skeleton components for different content types
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 animate-pulse ${className}`}>
      <div className="aspect-square bg-gray-700/50 rounded-lg mb-3"></div>
      <div className="h-4 bg-gray-700/50 rounded mb-2"></div>
      <div className="h-3 bg-gray-700/50 rounded w-3/4"></div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-700/50 rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
          <div className="h-8 bg-gray-700/50 rounded mb-2"></div>
          <div className="h-3 bg-gray-700/50 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 animate-pulse ${className}`}>
      <div className="h-6 bg-gray-700/50 rounded mb-4 w-1/3"></div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-700/50 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Page-specific loading states
export function NFTGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function StakingPoolSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonStats count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-700/50 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-700/50 rounded mb-2"></div>
                <div className="h-3 bg-gray-700/50 rounded w-2/3"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
                <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
              </div>
            </div>
            <div className="h-10 bg-gray-700/50 rounded mt-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl animate-pulse">
          <div className="w-10 h-10 bg-gray-700/50 rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700/50 rounded mb-2"></div>
            <div className="h-3 bg-gray-700/50 rounded w-2/3"></div>
          </div>
          <div className="h-4 bg-gray-700/50 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
}

// Full page loading state
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="text-center mb-8">
            <div className="h-12 bg-gray-700/50 rounded mx-auto mb-4 w-1/2"></div>
            <div className="h-6 bg-gray-700/50 rounded mx-auto w-1/3"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-8">
            <SkeletonStats count={4} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-6 bg-gray-700/50 rounded w-1/3"></div>
                <SkeletonText lines={5} />
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-700/50 rounded w-1/3"></div>
                <SkeletonText lines={5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Button loading state
interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...', 
  className = '',
  disabled = false,
  onClick
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`flex items-center justify-center gap-2 transition-all ${
        isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {isLoading ? loadingText : children}
    </button>
  );
}