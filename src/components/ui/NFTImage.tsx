'use client';

import { useState } from 'react';
import Image from 'next/image';

interface NFTImageProps {
  tokenId: number;
  className?: string;
  showId?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
  variant?: 'stake' | 'unstake' | 'default';
}

export function NFTImage({
  tokenId,
  className = '',
  showId = true,
  size = 'md',
  onClick,
  selected = false,
  variant = 'default'
}: NFTImageProps) {
  const [imageError, setImageError] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  // Variant styles
  const getVariantStyles = () => {
    if (!onClick) return '';
    
    const baseStyles = 'cursor-pointer transition-all duration-200 hover:scale-105';
    
    if (selected) {
      switch (variant) {
        case 'stake':
          return `${baseStyles} ring-2 ring-hyperliquid-500 bg-hyperliquid-500/20 scale-95`;
        case 'unstake':
          return `${baseStyles} ring-2 ring-red-500 bg-red-500/20 scale-95`;
        default:
          return `${baseStyles} ring-2 ring-blue-500 bg-blue-500/20 scale-95`;
      }
    }
    
    return `${baseStyles} hover:ring-2 hover:ring-gray-400`;
  };

  // Error state fallback
  if (imageError) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} ${getVariantStyles()} rounded-lg bg-dark-700 flex flex-col items-center justify-center text-gray-300`}
        onClick={onClick}
      >
        <div className="text-xs font-medium">#{tokenId}</div>
        <div className="text-xs text-gray-500 mt-1">Image Error</div>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${className} ${getVariantStyles()} rounded-lg overflow-hidden relative group`}
      onClick={onClick}
    >
      <video
        src="/images/pre-reveal.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
      
      {/* Overlay with token ID */}
      {showId && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="text-white text-xs font-bold">#{tokenId}</span>
        </div>
      )}
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-1 right-1">
          <div className={`w-3 h-3 rounded-full ${
            variant === 'stake' ? 'bg-hyperliquid-500' :
            variant === 'unstake' ? 'bg-red-500' : 'bg-blue-500'
          }`} />
        </div>
      )}
    </div>
  );
}

// Fallback component for when we just need a simple placeholder
export function NFTPlaceholder({
  tokenId,
  className = '',
  size = 'md',
  onClick,
  selected = false,
  variant = 'default'
}: Omit<NFTImageProps, 'showId'>) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const getVariantStyles = () => {
    if (!onClick) return '';
    
    const baseStyles = 'cursor-pointer transition-all duration-200 hover:scale-105';
    
    if (selected) {
      switch (variant) {
        case 'stake':
          return `${baseStyles} ring-2 ring-hyperliquid-500 bg-hyperliquid-500/20 scale-95`;
        case 'unstake':
          return `${baseStyles} ring-2 ring-red-500 bg-red-500/20 scale-95`;
        default:
          return `${baseStyles} ring-2 ring-blue-500 bg-blue-500/20 scale-95`;
      }
    }
    
    return `${baseStyles} hover:ring-2 hover:ring-gray-400`;
  };

  // Error state fallback
  if (imageError) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} ${getVariantStyles()} rounded-lg bg-dark-700 flex items-center justify-center text-gray-300 font-medium text-sm`}
        onClick={onClick}
      >
        #{tokenId}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${className} ${getVariantStyles()} rounded-lg overflow-hidden relative group`}
      onClick={onClick}
    >
      <video
        src="/images/pre-reveal.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-1 right-1">
          <div className={`w-3 h-3 rounded-full ${
            variant === 'stake' ? 'bg-hyperliquid-500' :
            variant === 'unstake' ? 'bg-red-500' : 'bg-blue-500'
          }`} />
        </div>
      )}
    </div>
  );
}