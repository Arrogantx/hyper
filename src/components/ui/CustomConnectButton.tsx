import { useState, useEffect, useCallback } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePublicClient } from "wagmi";
import { Address } from "viem";
import { getCurrentNetworkAddresses } from "@/contracts/addresses";
import { DOT_HYPE_RESOLVER_ABI } from "@/contracts/abis";

/**
 * Custom ConnectButton that shows primary domain name instead of truncated address
 * when a primary domain is set for the connected wallet
 */
export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="bg-gradient-to-r from-cyan-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-500 hover:to-cyan-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-3 rounded-lg transition-colors"
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          overflow: "hidden",
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            style={{ width: 20, height: 20 }}
                          />
                        )}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {chain.name}
                    </span>
                  </button>

                  <AccountButton
                    account={account}
                    openAccountModal={openAccountModal}
                  />
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

/**
 * Account button component that shows primary domain or truncated address
 */
interface AccountButtonProps {
  account: {
    address: string;
    displayBalance?: string;
  };
  openAccountModal: () => void;
}

function AccountButton({ account, openAccountModal }: AccountButtonProps) {
  const { primaryDomain, isLoading: primaryDomainLoading } = usePrimaryDomain(
    account?.address as Address
  );
  const { avatar, isLoading: avatarLoading } = useUserAvatar(
    account?.address as Address
  );

  const displayText =
    primaryDomain ||
    `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
  const showBalance = account.displayBalance
    ? ` (${account.displayBalance})`
    : "";

  const isLoading = primaryDomainLoading || avatarLoading;

  return (
    <button
      onClick={openAccountModal}
      type="button"
      className="flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors shadow-sm"
    >
      {/* Avatar or Status Indicator */}
      <div className="flex-shrink-0">
        {isLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        ) : avatar ? (
          <AvatarImage src={avatar} />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {displayText}
        </span>
        {showBalance && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {showBalance}
          </span>
        )}
      </div>
    </button>
  );
}

/**
 * Avatar image component with fallback
 */
interface AvatarImageProps {
  src: string;
}

function AvatarImage({ src }: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-green-500 rounded-full flex items-center justify-center">
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

// Hook implementations used in the CustomConnectButton above

/**
 * Hook to fetch the primary domain name for an address using the getName function
 * @param address - The Hyperliquid address to get the primary domain for
 */
export function usePrimaryDomain(address?: Address): {
  primaryDomain: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [primaryDomain, setPrimaryDomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const addresses = getCurrentNetworkAddresses();
  const resolverAddress = addresses.DOT_HYPE_RESOLVER as Address;

  const fetchPrimaryDomain = useCallback(async () => {
    if (!publicClient || !address) {
      setPrimaryDomain(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call getName function on the resolver
      const domainName = await publicClient.readContract({
        address: resolverAddress,
        abi: DOT_HYPE_RESOLVER_ABI,
        functionName: "getName",
        args: [address],
      });

      // Check if we got a valid domain name
      if (
        domainName &&
        typeof domainName === "string" &&
        domainName.trim() !== ""
      ) {
        setPrimaryDomain(domainName);
      } else {
        setPrimaryDomain(null);
      }
    } catch (err) {
      console.error("Error fetching primary domain:", err);

      // Handle specific error cases
      let errorMessage = "Failed to fetch primary domain";
      if (err instanceof Error) {
        if (err.message.includes("execution reverted")) {
          errorMessage = "No primary domain set for this address";
        } else if (err.message.includes("OpcodeNotFound")) {
          errorMessage = "Resolver contract does not support getName function";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setPrimaryDomain(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient, resolverAddress]);

  useEffect(() => {
    fetchPrimaryDomain();
  }, [fetchPrimaryDomain]);

  return {
    primaryDomain,
    isLoading,
    error,
    refetch: fetchPrimaryDomain,
  };
}

/**
 * Hook to fetch the user's avatar from their primary domain's text records
 * Uses the resolver's getValue function to get the avatar directly by address
 */
export function useUserAvatar(address?: Address): {
  avatar: string | null;
  isLoading: boolean;
  error: string | null;
} {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();

  useEffect(() => {
    if (!address || !publicClient) {
      setAvatar(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchAvatar = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { DOT_HYPE_RESOLVER } = getCurrentNetworkAddresses();

        // Use getValue to get the avatar text record directly by address
        const avatarValue = (await publicClient.readContract({
          address: DOT_HYPE_RESOLVER as `0x${string}`,
          abi: DOT_HYPE_RESOLVER_ABI,
          functionName: "getValue",
          args: [address, "avatar"],
        })) as string;

        // Only set avatar if it's a valid non-empty string
        if (avatarValue && avatarValue.trim() !== "") {
          setAvatar(avatarValue.trim());
        } else {
          setAvatar(null);
        }
      } catch (err) {
        console.warn("Error fetching user avatar:", err);
        setAvatar(null);
        setError(err instanceof Error ? err.message : "Failed to fetch avatar");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatar();
  }, [address, publicClient]);

  return {
    avatar,
    isLoading,
    error,
  };
}