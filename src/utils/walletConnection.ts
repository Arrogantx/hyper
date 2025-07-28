import { HYPEREVM_CONFIG } from '@/lib/constants';
import { getEthereumProvider } from './getEthereumProvider';

// Wallet connection utilities for HyperEVM chain
export interface WalletConnectionError {
  code: string;
  message: string;
  details?: string;
}

// Common wallet connection error codes
export const WALLET_ERROR_CODES = {
  CHAIN_NOT_ADDED: 'CHAIN_NOT_ADDED',
  CHAIN_SWITCH_FAILED: 'CHAIN_SWITCH_FAILED',
  USER_REJECTED: 'USER_REJECTED',
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  RPC_ERROR: 'RPC_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Add HyperEVM chain to wallet (MetaMask, etc.)
export async function addHyperEVMChain(): Promise<boolean> {
    const provider = await getEthereumProvider();
    if (!provider) {
        throw new Error('No wallet detected');
    }

  try {
    // First try to switch to the chain
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${HYPEREVM_CONFIG.id.toString(16)}` }],
    });
    return true;
  } catch (switchError: any) {
    // If chain doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${HYPEREVM_CONFIG.id.toString(16)}`,
              chainName: HYPEREVM_CONFIG.name,
              nativeCurrency: HYPEREVM_CONFIG.nativeCurrency,
              rpcUrls: [HYPEREVM_CONFIG.rpcUrls.default.http[0]],
              blockExplorerUrls: [HYPEREVM_CONFIG.blockExplorers.default.url],
            },
          ],
        });
        return true;
      } catch (addError: any) {
        console.error('Failed to add HyperEVM chain:', addError);
        throw new Error(`Failed to add HyperEVM chain: ${addError.message}`);
      }
    } else {
      console.error('Failed to switch to HyperEVM chain:', switchError);
      throw new Error(`Failed to switch to HyperEVM chain: ${switchError.message}`);
    }
  }
}

// Check if wallet supports HyperEVM chain
export async function checkChainSupport(): Promise<boolean> {
    const provider = await getEthereumProvider();
    if (!provider) {
        return false;
    }

  try {
    const chainId = await provider.request({ method: 'eth_chainId' });
    return chainId === `0x${HYPEREVM_CONFIG.id.toString(16)}`;
  } catch (error) {
    console.error('Failed to check chain support:', error);
    return false;
  }
}

// Test RPC connection
export async function testRPCConnection(): Promise<boolean> {
  try {
    const response = await fetch(HYPEREVM_CONFIG.rpcUrls.default.http[0], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status}`);
    }

    const data = await response.json();
    return !!data.result;
  } catch (error) {
    console.error('RPC connection test failed:', error);
    return false;
  }
}

// Enhanced wallet connection with diagnostics
export async function connectWalletWithDiagnostics(): Promise<{
  success: boolean;
  error?: WalletConnectionError;
  diagnostics: {
    walletDetected: boolean;
    chainSupported: boolean;
    rpcWorking: boolean;
  };
}> {
  const diagnostics = {
    walletDetected: !!(await getEthereumProvider()),
    chainSupported: false,
    rpcWorking: false,
  };

  try {
    // Check if wallet is detected
    if (!diagnostics.walletDetected) {
      return {
        success: false,
        error: {
          code: WALLET_ERROR_CODES.WALLET_NOT_FOUND,
          message: 'No wallet detected. Please install MetaMask or another Web3 wallet.',
        },
        diagnostics,
      };
    }

    // Test RPC connection
    diagnostics.rpcWorking = await testRPCConnection();
    if (!diagnostics.rpcWorking) {
      return {
        success: false,
        error: {
          code: WALLET_ERROR_CODES.RPC_ERROR,
          message: 'HyperEVM RPC is not responding. Please try again later.',
          details: 'The blockchain network may be experiencing issues.',
        },
        diagnostics,
      };
    }

    // Check chain support
    diagnostics.chainSupported = await checkChainSupport();
    
    // Add/switch to HyperEVM chain if needed
    if (!diagnostics.chainSupported) {
      await addHyperEVMChain();
      diagnostics.chainSupported = await checkChainSupport();
    }

    return {
      success: true,
      diagnostics,
    };
  } catch (error: any) {
    let errorCode: string = WALLET_ERROR_CODES.UNKNOWN_ERROR;
    let errorMessage = 'An unknown error occurred';

    if (error.code === 4001) {
      errorCode = WALLET_ERROR_CODES.USER_REJECTED;
      errorMessage = 'Connection was rejected by user';
    } else if (error.message.includes('chain')) {
      errorCode = WALLET_ERROR_CODES.CHAIN_SWITCH_FAILED;
      errorMessage = 'Failed to add or switch to HyperEVM chain';
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: error.message,
      },
      diagnostics,
    };
  }
}

// Wallet connection instructions for users
export const WALLET_INSTRUCTIONS = {
  METAMASK: {
    name: 'MetaMask',
    steps: [
      'Install MetaMask browser extension',
      'Create or import your wallet',
      'Click "Connect Wallet" on our site',
      'Approve the HyperEVM network addition when prompted',
    ],
  },
  GENERAL: {
    name: 'General Wallet',
    steps: [
      'Ensure your wallet supports custom networks',
      'Make sure you have the latest version installed',
      'Try refreshing the page and connecting again',
      'Check that your wallet is unlocked',
    ],
  },
} as const;

// Window.ethereum is already declared by wagmi/viem