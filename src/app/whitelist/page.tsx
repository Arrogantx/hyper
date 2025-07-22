'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function WhitelistPage() {
  const [address, setAddress] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    isWhitelisted: boolean;
    message: string;
    tier?: string;
  } | null>(null);

  const validateAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const checkWhitelist = async () => {
    if (!address.trim()) {
      setResult({
        isWhitelisted: false,
        message: 'Please enter a wallet address'
      });
      return;
    }

    if (!validateAddress(address)) {
      setResult({
        isWhitelisted: false,
        message: 'Invalid wallet address format'
      });
      return;
    }

    setIsChecking(true);
    setResult(null);

    // Simulate API call - replace with actual whitelist check
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock whitelist logic - replace with actual implementation
    const mockWhitelisted = Math.random() > 0.5;
    const tiers = ['Diamond', 'Gold', 'Silver', 'Bronze'];
    const randomTier = tiers[Math.floor(Math.random() * tiers.length)];

    setResult({
      isWhitelisted: mockWhitelisted,
      message: mockWhitelisted 
        ? `Congratulations! Your address is whitelisted.`
        : 'Sorry, your address is not on the whitelist.',
      tier: mockWhitelisted ? randomTier : undefined
    });

    setIsChecking(false);
  };

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
                        <li>• Reduced gas fees</li>
                        <li>• Exclusive utility features</li>
                        {result.tier === 'Diamond' && <li>• Free minting (gas only)</li>}
                        {result.tier === 'Gold' && <li>• 50% discount on minting</li>}
                        {result.tier === 'Silver' && <li>• 25% discount on minting</li>}
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
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">Whitelist Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                  <span className="text-white font-semibold">Diamond</span>
                  <span className="text-gray-400">- Free mint</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                  <span className="text-white font-semibold">Gold</span>
                  <span className="text-gray-400">- 50% discount</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full"></div>
                  <span className="text-white font-semibold">Silver</span>
                  <span className="text-gray-400">- 25% discount</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-full"></div>
                  <span className="text-white font-semibold">Bronze</span>
                  <span className="text-gray-400">- Priority access</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}