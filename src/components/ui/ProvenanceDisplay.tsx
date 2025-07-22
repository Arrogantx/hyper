'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useSuccessToast, useErrorToast } from './Toast';

const EXPECTED_HASH = "87a57cb882d4a2dbc0b539e5fe9237eee6ebdf912633720e03ec3fc99f7f27ee";

interface ProvenanceState {
  hash: string | null;
  verified: boolean;
  loading: boolean;
  error: string | null;
}

export function ProvenanceDisplay() {
  const [provenance, setProvenance] = useState<ProvenanceState>({
    hash: null,
    verified: false,
    loading: true,
    error: null,
  });
  const [copied, setCopied] = useState(false);

  const showSuccessToast = useSuccessToast();
  const showErrorToast = useErrorToast();

  useEffect(() => {
    const fetchProvenance = async () => {
      try {
        const response = await fetch("https://cgotxofggbmzkksotodg.supabase.co/functions/v1/verify-provenance");
        const data = await response.json();
        
        const match = data.provenanceHash === EXPECTED_HASH;
        setProvenance({ 
          hash: data.provenanceHash, 
          verified: match, 
          loading: false, 
          error: null 
        });
      } catch (err) {
        setProvenance({ 
          hash: null, 
          verified: false, 
          loading: false, 
          error: err instanceof Error ? err.message : 'Failed to fetch provenance hash'
        });
      }
    };

    fetchProvenance();
  }, []);

  const copyHash = async () => {
    if (!provenance.hash) return;
    
    try {
      await navigator.clipboard.writeText(provenance.hash);
      setCopied(true);
      showSuccessToast('Provenance hash copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showErrorToast('Failed to copy hash to clipboard');
    }
  };

  if (provenance.loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 sm:p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-hyperliquid-500/10 rounded-lg">
            <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-hyperliquid-400 animate-pulse" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">🧬 Provenance Verification</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hyperliquid-400"></div>
          <span className="ml-3 text-dark-300">Loading provenance hash...</span>
        </div>
      </motion.div>
    );
  }

  if (provenance.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 sm:p-6 border-red-500/30"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">🧬 Provenance Verification</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-red-400 font-medium">Error loading provenance data</p>
          <p className="text-dark-400 text-sm mt-2">{provenance.error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 sm:p-6 ${
        provenance.verified 
          ? 'border-hyperliquid-500/30 shadow-lg shadow-hyperliquid-500/10' 
          : 'border-yellow-500/30 shadow-lg shadow-yellow-500/10'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            provenance.verified ? 'bg-hyperliquid-500/10' : 'bg-yellow-500/10'
          }`}>
            {provenance.verified ? (
              <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-hyperliquid-400" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">🧬 Provenance Verification</h3>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          provenance.verified 
            ? 'bg-hyperliquid-500/20 text-hyperliquid-400 border border-hyperliquid-500/30'
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {provenance.verified ? 'VERIFIED' : 'MISMATCH'}
        </div>
      </div>

      <div className="space-y-4">
        {/* Hash Display */}
        <div className="glass rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-dark-400 text-sm font-medium">Collection Hash</span>
            <button
              onClick={copyHash}
              className="flex items-center space-x-1 text-xs text-hyperliquid-400 hover:text-hyperliquid-300 transition-colors"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-3 w-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <code className="text-xs sm:text-sm text-hyperliquid-400 break-all font-mono bg-dark-800/50 p-2 rounded block">
            {provenance.hash}
          </code>
        </div>

        {/* Verification Status */}
        <div className={`p-3 sm:p-4 rounded-xl border ${
          provenance.verified
            ? 'bg-hyperliquid-500/5 border-hyperliquid-500/20'
            : 'bg-yellow-500/5 border-yellow-500/20'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`p-1 rounded-full mt-0.5 ${
              provenance.verified ? 'bg-hyperliquid-500' : 'bg-yellow-500'
            }`}>
              {provenance.verified ? (
                <CheckIcon className="h-3 w-3 text-white" />
              ) : (
                <ExclamationTriangleIcon className="h-3 w-3 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium text-sm sm:text-base ${
                provenance.verified ? 'text-hyperliquid-400' : 'text-yellow-400'
              }`}>
                {provenance.verified
                  ? '✅ Verified against on-chain provenance hash'
                  : '⚠️ Hash mismatch: check metadata integrity'}
              </p>
              <p className="text-dark-400 text-xs sm:text-sm mt-1">
                {provenance.verified
                  ? 'This collection\'s metadata integrity has been cryptographically verified.'
                  : 'The provenance hash does not match the expected value. Please verify the collection authenticity.'}
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="text-center pt-2">
          <p className="text-dark-500 text-xs">
            Provenance hashes ensure the authenticity and integrity of NFT metadata
          </p>
        </div>
      </div>
    </motion.div>
  );
}