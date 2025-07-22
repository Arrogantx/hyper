'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWalletDisplay } from '../../hooks/useHypeDomain';
import { Address } from '../../utils/hypeResolver';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface HypeConnectButtonProps {
  showBalance?: boolean;
  chainStatus?: 'full' | 'icon' | 'name' | 'none';
  accountStatus?: 'full' | 'avatar' | 'address' | { smallScreen: 'avatar' | 'address'; largeScreen: 'full' | 'avatar' | 'address' };
  label?: string;
  className?: string;
}

/**
 * Custom connect button that displays .hype domain names when available
 * Falls back to truncated addresses when no domain is set
 */
export function HypeConnectButton({
  showBalance = false,
  chainStatus = 'full',
  accountStatus = 'full',
  label = 'Connect Wallet',
  className = '',
}: HypeConnectButtonProps) {
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
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className={className}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {label}
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  {chainStatus !== 'none' && (
                    <button
                      onClick={openChainModal}
                      style={{ display: 'flex', alignItems: 'center' }}
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 8,
                          }}
                        >
                          {chain.iconUrl && (
                            <Image
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              width={20}
                              height={20}
                            />
                          )}
                        </div>
                      )}
                      {chainStatus === 'full' || chainStatus === 'name' ? chain.name : null}
                    </button>
                  )}

                  <HypeAccountButton
                    account={account}
                    showBalance={showBalance}
                    accountStatus={accountStatus}
                    onClick={openAccountModal}
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

interface HypeAccountButtonProps {
  account: {
    address: string;
    balanceDecimals?: number;
    balanceFormatted?: string;
    balanceSymbol?: string;
    displayBalance?: string;
    displayName: string;
    ensAvatar?: string;
    ensName?: string;
    hasPendingTransactions: boolean;
  };
  showBalance: boolean;
  accountStatus: HypeConnectButtonProps['accountStatus'];
  onClick: () => void;
}

function HypeAccountButton({ account, showBalance, accountStatus, onClick }: HypeAccountButtonProps) {
  const { displayName, avatar, isLoading, primaryDomain } = useWalletDisplay(account.address as Address);

  // Determine what to show based on accountStatus
  const getDisplayContent = () => {
    if (typeof accountStatus === 'object') {
      // Responsive display
      return {
        smallScreen: accountStatus.smallScreen,
        largeScreen: accountStatus.largeScreen,
      };
    }
    return {
      smallScreen: accountStatus,
      largeScreen: accountStatus,
    };
  };

  const displayContent = getDisplayContent();

  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      {/* Avatar */}
      {(displayContent.largeScreen === 'full' || displayContent.largeScreen === 'avatar') && (
        <div className="hidden sm:flex items-center mr-2">
          {isLoading ? (
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          ) : (
            <Image
              src={avatar || account.ensAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${account.address}&backgroundColor=22c55e&size=24`}
              alt="Avatar"
              width={24}
              height={24}
              className="rounded-full"
            />
          )}
        </div>
      )}

      {/* Mobile avatar */}
      {(displayContent.smallScreen === 'avatar' || displayContent.smallScreen === 'full') && (
        <div className="flex sm:hidden items-center mr-2">
          {isLoading ? (
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          ) : (
            <Image
              src={avatar || account.ensAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${account.address}&backgroundColor=22c55e&size=24`}
              alt="Avatar"
              width={24}
              height={24}
              className="rounded-full"
            />
          )}
        </div>
      )}

      {/* Account name/address */}
      <div className="flex flex-col items-start">
        {/* Desktop display */}
        <div className="hidden sm:block">
          {displayContent.largeScreen === 'full' || displayContent.largeScreen === 'address' ? (
            <span className="text-sm font-medium">
              {isLoading ? (
                <span className="inline-block w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                primaryDomain || displayName
              )}
            </span>
          ) : null}
        </div>

        {/* Mobile display */}
        <div className="block sm:hidden">
          {displayContent.smallScreen === 'full' || displayContent.smallScreen === 'address' ? (
            <span className="text-sm font-medium">
              {isLoading ? (
                <span className="inline-block w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                primaryDomain || displayName
              )}
            </span>
          ) : null}
        </div>

        {/* Balance */}
        {showBalance && account.displayBalance && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {account.displayBalance}
          </span>
        )}
      </div>

      {/* Dropdown indicator */}
      <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400" />

      {/* Pending transactions indicator */}
      {account.hasPendingTransactions && (
        <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </button>
  );
}

export default HypeConnectButton;