import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePrimaryDomain, useUserAvatar } from "@/hooks/useHypeDomain";
import { Address } from "viem";

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