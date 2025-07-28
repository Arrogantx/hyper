'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { useWalletDisplay } from '@/hooks/useHypeDomain';
import {
  connectWalletWithDiagnostics,
  WALLET_ERROR_CODES,
  WALLET_INSTRUCTIONS,
  type WalletConnectionError
} from '@/utils/walletConnection';
import { HYPEREVM_CHAIN_ID } from '@/lib/constants';
import { AlertCircle, CheckCircle, Loader2, Wifi, WifiOff } from 'lucide-react';

interface ConnectionDiagnostics {
  walletDetected: boolean;
  chainSupported: boolean;
  rpcWorking: boolean;
}

export function EnhancedConnectButton() {
  const { address, isConnected } = useAccount();
  const { displayName, avatar, isLoading: isDisplayLoading } = useWalletDisplay(address);
  const chainId = useChainId();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<WalletConnectionError | null>(null);
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostics | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Check if we're on the correct chain
  const isCorrectChain = chainId === HYPEREVM_CHAIN_ID;

  // Enhanced connection handler
  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const result = await connectWalletWithDiagnostics();
      setDiagnostics(result.diagnostics);
      
      if (!result.success && result.error) {
        setConnectionError(result.error);
        setShowDiagnostics(true);
      }
    } catch (error: any) {
      setConnectionError({
        code: WALLET_ERROR_CODES.UNKNOWN_ERROR,
        message: 'Failed to connect wallet',
        details: error.message,
      });
      setShowDiagnostics(true);
    } finally {
      setIsConnecting(false);
    }
  };

  // Auto-hide diagnostics after successful connection
  useEffect(() => {
    if (isConnected && isCorrectChain) {
      setShowDiagnostics(false);
      setConnectionError(null);
    }
  }, [isConnected, isCorrectChain]);

  return (
    <div className="relative">
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
          const ready = mounted && authenticationStatus !== 'loading';
          const connected = ready && account && chain && 
            (!authenticationStatus || authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <div className="space-y-4">
                      <button
                        onClick={connectionError ? handleConnect : openConnectModal}
                        disabled={isConnecting}
                        className="bg-gradient-to-r from-cyan-500 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-500 hover:to-cyan-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : connectionError ? (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            Retry Connection
                          </>
                        ) : (
                          'Connect Wallet'
                        )}
                      </button>

                      {/* Connection Error Display */}
                      {connectionError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                              <h4 className="font-medium text-red-400">Connection Failed</h4>
                              <p className="text-sm text-red-300">{connectionError.message}</p>
                              {connectionError.details && (
                                <p className="text-xs text-red-400 opacity-75">
                                  {connectionError.details}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => setShowDiagnostics(!showDiagnostics)}
                            className="text-xs text-red-300 hover:text-red-200 underline"
                          >
                            {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
                          </button>
                        </div>
                      )}

                      {/* Diagnostics Panel */}
                      {showDiagnostics && diagnostics && (
                        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 space-y-3">
                          <h4 className="font-medium text-white flex items-center gap-2">
                            <Wifi className="w-4 h-4" />
                            Connection Diagnostics
                          </h4>
                          
                          <div className="space-y-2 text-sm">
                            <DiagnosticItem
                              label="Wallet Detected"
                              status={diagnostics.walletDetected}
                              description={diagnostics.walletDetected ? 
                                'Web3 wallet found' : 
                                'No wallet extension detected'
                              }
                            />
                            <DiagnosticItem
                              label="HyperEVM Chain"
                              status={diagnostics.chainSupported}
                              description={diagnostics.chainSupported ? 
                                'Chain configured correctly' : 
                                'HyperEVM chain needs to be added'
                              }
                            />
                            <DiagnosticItem
                              label="RPC Connection"
                              status={diagnostics.rpcWorking}
                              description={diagnostics.rpcWorking ? 
                                'Network is responding' : 
                                'Network connection issues'
                              }
                            />
                          </div>

                          {/* Troubleshooting Tips */}
                          <div className="mt-4 pt-3 border-t border-gray-600">
                            <h5 className="text-xs font-medium text-gray-300 mb-2">Troubleshooting Tips:</h5>
                            <ul className="text-xs text-gray-400 space-y-1">
                              {!diagnostics.walletDetected && (
                                <li>• Install MetaMask or another Web3 wallet extension</li>
                              )}
                              {!diagnostics.chainSupported && (
                                <li>• Allow the app to add HyperEVM network to your wallet</li>
                              )}
                              {!diagnostics.rpcWorking && (
                                <li>• Check your internet connection and try again</li>
                              )}
                              <li>• Refresh the page and try connecting again</li>
                              <li>• Make sure your wallet is unlocked</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (chain?.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <WifiOff className="w-4 h-4" />
                      Wrong Network
                    </button>
                  );
                }

                return (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={openChainModal}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-3 rounded-lg transition-colors"
                    >
                      {chain?.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 20, height: 20 }}
                            />
                          )}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {chain?.name}
                      </span>
                    </button>

                    <button
                      onClick={openAccountModal}
                      className="flex items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors shadow-sm"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isDisplayLoading ? 'Loading...' : displayName}
                      </span>
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

// Diagnostic item component
interface DiagnosticItemProps {
  label: string;
  status: boolean;
  description: string;
}

function DiagnosticItem({ label, status, description }: DiagnosticItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {status ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-400" />
        )}
        <span className={status ? 'text-green-300' : 'text-red-300'}>
          {label}
        </span>
      </div>
      <span className="text-xs text-gray-400">
        {description}
      </span>
    </div>
  );
}