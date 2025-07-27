'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { HYPERCATZ_NFT_ADDRESS, HYPERCATZ_NFT_ABI } from '@/contracts/HypercatzNFT';
import Image from 'next/image';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

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
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get token URI from contract
  const { data: tokenURI, isLoading: uriLoading, error: uriError } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
    query: {
      enabled: tokenId >= 0,
    },
  });

  // Fetch metadata from URI
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenURI || uriLoading) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(tokenURI as string);
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.status}`);
        }
        const data = await response.json();
        setMetadata(data);
      } catch (error) {
        console.error(`Error fetching metadata for token ${tokenId}:`, error);
        setMetadata(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenURI, tokenId, uriLoading]);

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

  // Loading state
  if (isLoading || uriLoading) {
    return (
      <div 
        className={`${sizeClasses[size]} ${className} ${getVariantStyles()} rounded-lg bg-dark-700 flex items-center justify-center animate-pulse`}
        onClick={onClick}
      >
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error state or no metadata
  if (uriError || !metadata || imageError) {
    return (
      <div 
        className={`${sizeClasses[size]} ${className} ${getVariantStyles()} rounded-lg bg-dark-700 flex flex-col items-center justify-center text-gray-300`}
        onClick={onClick}
      >
        <div className="text-xs font-medium">#{tokenId}</div>
        {(uriError || !metadata) && (
          <div className="text-xs text-gray-500 mt-1">No Data</div>
        )}
        {imageError && (
          <div className="text-xs text-gray-500 mt-1">Image Error</div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${className} ${getVariantStyles()} rounded-lg overflow-hidden relative group`}
      onClick={onClick}
    >
      <Image
        src={metadata.image}
        alt={metadata.name || `Hypercatz #${tokenId}`}
        fill
        className="object-cover"
        onError={() => setImageError(true)}
        sizes="(max-width: 768px) 80px, 96px"
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

  return (
    <div 
      className={`${sizeClasses[size]} ${className} ${getVariantStyles()} rounded-lg bg-dark-700 flex items-center justify-center text-gray-300 font-medium text-sm`}
      onClick={onClick}
    >
      #{tokenId}
    </div>
  );
}