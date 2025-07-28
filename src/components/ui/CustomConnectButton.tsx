'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { Address } from 'viem';
import { getCurrentNetworkAddresses } from '@/contracts/addresses';
import { DOT_HYPE_RESOLVER_ABI } from '@/contracts/abis';
import '@/styles/custom-connect-button.css';

/**
 * Hook to fetch the primary domain name for an address
 */
export function usePrimaryDomain(address?: Address): { primaryDomain: string | null; isLoading: boolean; } {
  const [primaryDomain, setPrimaryDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();
  const addresses = getCurrentNetworkAddresses();
  const resolverAddress = addresses.DOT_HYPE_RESOLVER as Address;

  const fetchPrimaryDomain = useCallback(async () => {
    if (!publicClient || !address) {
      setPrimaryDomain(null);
      return;
    }
    setIsLoading(true);
    try {
      const domainName = await publicClient.readContract({
        address: resolverAddress,
        abi: DOT_HYPE_RESOLVER_ABI,
        functionName: 'getName',
        args: [address],
      });
      if (domainName && typeof domainName === 'string' && domainName.trim() !== '') {
        setPrimaryDomain(domainName);
      } else {
        setPrimaryDomain(null);
      }
    } catch (err) {
      console.error('Error fetching primary domain:', err);
      setPrimaryDomain(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient, resolverAddress]);

  useEffect(() => {
    fetchPrimaryDomain();
  }, [fetchPrimaryDomain]);

  return { primaryDomain, isLoading };
}

/**
 * Hook to fetch the user's avatar from their primary domain's text records
 */
export function useUserAvatar(address?: Address): { avatar: string | null; isLoading: boolean; } {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!address || !publicClient) {
      setAvatar(null);
      return;
    }
    const fetchAvatar = async () => {
      setIsLoading(true);
      try {
        const { DOT_HYPE_RESOLVER } = getCurrentNetworkAddresses();
        const avatarValue = (await publicClient.readContract({
          address: DOT_HYPE_RESOLVER as `0x${string}`,
          abi: DOT_HYPE_RESOLVER_ABI,
          functionName: 'getValue',
          args: [address, 'avatar'],
        })) as string;
        if (avatarValue && avatarValue.trim() !== '') {
          setAvatar(avatarValue.trim());
        } else {
          setAvatar(null);
        }
      } catch (err) {
        console.warn('Error fetching user avatar:', err);
        setAvatar(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvatar();
  }, [address, publicClient]);

  return { avatar, isLoading };
}

// --- Custom Button Components ---

/**
 * Avatar image component with fallback
 */
function AvatarImage({ src }: { src: string }) {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-hype-primary to-hype-secondary rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt="User avatar"
      className="w-8 h-8 rounded-full object-cover border-2 border-green-500"
      onError={() => setHasError(true)}
    />
  );
}

/**
 * Account button component that shows primary domain or truncated address
 */
function AccountButton({ account, onOpenModal }: { account: { address: string; }; onOpenModal: () => void; }) {
  const { primaryDomain, isLoading: primaryDomainLoading } = usePrimaryDomain(account?.address as Address);
  const { avatar, isLoading: avatarLoading } = useUserAvatar(account?.address as Address);

  const displayText = primaryDomain || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
  const isLoading = primaryDomainLoading || avatarLoading;

  return (
    <button onClick={onOpenModal} type="button" className="account-button">
      <div className="flex-shrink-0">
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : avatar ? (
          <AvatarImage src={avatar} />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-hype-primary to-hype-secondary rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
      <div className="account-info">
        <span className="text-sm font-medium">{displayText}</span>
      </div>
    </button>
  );
}

/**
 * Main CustomConnectButton to integrate with Reown AppKit
 */
export function CustomConnectButton() {
  const { address, isConnected } = useAccount();
  const appKitButtonRef = useRef<HTMLElement>(null);

  const handleOpenModal = () => {
    appKitButtonRef.current?.click();
  };

  return (
    <div>
      {isConnected && address ? (
        <AccountButton account={{ address }} onOpenModal={handleOpenModal} />
      ) : (
        <button onClick={handleOpenModal} type="button" className="connect-button">
          Connect Wallet
        </button>
      )}
      <div style={{ display: 'none' }}>
        <appkit-button ref={appKitButtonRef} />
      </div>
    </div>
  );
}