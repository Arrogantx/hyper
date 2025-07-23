'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReadContract } from 'wagmi';
import { isAddress } from 'viem';
import Button from '@/components/ui/Button';
import { CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { HYPERCATZ_NFT_ADDRESS, HYPERCATZ_NFT_ABI, HypercatzPhase } from '@/contracts/HypercatzNFT';

export default function WhitelistPage() {
  const [address, setAddress] = useState('');
  const [checkAddress, setCheckAddress] = useState<string | null>(null);
  const [result, setResult] = useState<{
    isWhitelisted: boolean;
    message: string;
    tier?: string;
    phaseAccess?: HypercatzPhase;
  } | null>(null);

  // Read contract data for the address being checked
  const { data: phaseAccess, isLoading: isChecking, error } = useReadContract({
    address: HYPERCATZ_NFT_ADDRESS,
    abi: HYPERCATZ_NFT_ABI,
    functionName: 'phaseAccess',
    args: checkAddress ? [checkAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!checkAddress && isAddress(checkAddress),
    },
  });

  const getPhaseString = (phase: HypercatzPhase): string => {
    switch (phase) {
      case HypercatzPhase.GUARANTEED:
        return 'GUARANTEED';
      case HypercatzPhase.WHITELIST:
        return 'WHITELIST';
      case HypercatzPhase.PUBLIC:
        return 'PUBLIC';
      default:
        return 'UNKNOWN';
    }
  };

  const getTierFromPhase = (phase: HypercatzPhase): string => {
    switch (phase) {
      case HypercatzPhase.GUARANTEED:
        return 'Diamond';
      case HypercatzPhase.WHITELIST:
        return 'Gold';
      case HypercatzPhase.PUBLIC:
        return 'Bronze';
      default:
        return 'None';
    }
  };

  const checkWhitelist = async () => {
    if (!address.trim()) {
      setResult({
        isWhitelisted: false,
        message: 'Please enter a wallet address'
      });
      return;
    }

    if (!isAddress(address)) {
      setResult({
        isWhitelisted: false,
        message: 'Invalid wallet address format'
      });
      return;
    }

    setResult(null);
    setCheckAddress(address);
  };

  // Update result when contract data is loaded
  useEffect(() => {
    if (checkAddress && phaseAccess !== undefined && !isChecking) {
      const phase = phaseAccess as HypercatzPhase;
      const isWhitelisted = phase <= HypercatzPhase.WHITELIST; // GUARANTEED or WHITELIST
      const tier = getTierFromPhase(phase);
      const phaseString = getPhaseString(phase);

      setResult({
        isWhitelisted,
        message: isWhitelisted
          ? `Congratulations! Your address has ${phaseString} access.`
          : 'Your address has PUBLIC access only.',
        tier: isWhitelisted ? tier : undefined,
        phaseAccess: phase
      });
    }

    if (error && checkAddress) {
      setResult({
        isWhitelisted: false,
        message: 'Error checking whitelist status. Please try again.'
      });
    }
  }, [phaseAccess, isChecking, error, checkAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    if (result) setResult(null); // Clear previous results when typing
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              WHITELIST CHECKER
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Verify if your wallet address is eligible for priority minting
            </motion.p>
          </div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8"
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-3">
                  Wallet Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={handleInputChange}
                    placeholder="0x1234567890abcdef1234567890abcdef12345678"
                    className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    disabled={isChecking}
                  />
                  <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <Button
                onClick={checkWhitelist}
                disabled={isChecking || !address.trim()}
                className="w-full py-4 text-lg font-semibold"
                variant="primary"
              >
                {isChecking ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Checking...</span>
                  </div>
                ) : (
                  'Check Whitelist Status'
                )}
              </Button>
            </div>
          </motion.div>

          {/* Results Section */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`bg-gradient-to-r p-[1px] rounded-2xl ${
                result.isWhitelisted 
                  ? 'from-green-400 via-cyan-400 to-green-400' 
                  : 'from-red-400 via-pink-400 to-red-400'
              }`}
            >
              <div className="bg-gray-900 rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-4">
                  {result.isWhitelisted ? (
                    <CheckCircleIcon className="h-8 w-8 text-green-400" />
                  ) : (
                    <XCircleIcon className="h-8 w-8 text-red-400" />
                  )}
                  <div>
                    <h3 className={`text-2xl font-bold ${
                      result.isWhitelisted ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.isWhitelisted ? 'Whitelisted!' : 'Not Whitelisted'}
                    </h3>
                    {result.tier && (
                      <p className="text-cyan-400 font-semibold">
                        Tier: {result.tier}
                      </p>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-300 text-lg mb-6">
                  {result.message}
                </p>

                {result.isWhitelisted && (
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="text-cyan-400 font-semibold mb-2">Benefits:</h4>
                      <ul className="text-gray-300 space-y-1">
                        <li>• Priority minting access</li>
                        <li>• Exclusive utility features</li>
                        <li>• Early access to games and staking</li>
                        {result.tier === 'Diamond' && (
                          <>
                            <li>• Guaranteed mint allocation</li>
                            <li>• Maximum mint per wallet: 1</li>
                            <li>• First priority access</li>
                          </>
                        )}
                        {result.tier === 'Gold' && (
                          <>
                            <li>• Whitelist mint access</li>
                            <li>• Maximum mint per wallet: 3</li>
                            <li>• Second priority access</li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    <Button
                      onClick={() => window.location.href = '/mint'}
                      className="w-full py-3"
                      variant="primary"
                    >
                      Proceed to Minting
                    </Button>
                  </div>
                )}

                {!result.isWhitelisted && (
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <h4 className="text-cyan-400 font-semibold mb-2">How to get whitelisted:</h4>
                      <ul className="text-gray-300 space-y-1">
                        <li>• Follow @HypercatzNFT on Twitter</li>
                        <li>• Join our Discord community</li>
                        <li>• Participate in community events</li>
                        <li>• Hold qualifying NFTs</li>
                      </ul>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => window.open('https://twitter.com/hypercatznft', '_blank')}
                        className="flex-1 py-3"
                        variant="secondary"
                      >
                        Follow Twitter
                      </Button>
                      <Button
                        onClick={() => window.open('https://discord.gg/hypercatz', '_blank')}
                        className="flex-1 py-3"
                        variant="secondary"
                      >
                        Join Discord
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">Access Tiers</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                  <span className="text-white font-semibold">Diamond (Guaranteed)</span>
                </div>
                <span className="text-gray-400 text-sm">Max 1 mint • First priority</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                  <span className="text-white font-semibold">Gold (Whitelist)</span>
                </div>
                <span className="text-gray-400 text-sm">Max 3 mints • Second priority</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-full"></div>
                  <span className="text-white font-semibold">Bronze (Public)</span>
                </div>
                <span className="text-gray-400 text-sm">Standard access • No priority</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}