// Staking-specific error handling utilities

export interface StakingError {
  code: string;
  message: string;
  userMessage: string;
}

export const STAKING_ERROR_CODES = {
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  CONTRACT_NOT_DEPLOYED: 'CONTRACT_NOT_DEPLOYED',
  INSUFFICIENT_NFTS: 'INSUFFICIENT_NFTS',
  NO_NFTS_SELECTED: 'NO_NFTS_SELECTED',
  POOL_NOT_ACTIVE: 'POOL_NOT_ACTIVE',
  NFTS_LOCKED: 'NFTS_LOCKED',
  NO_REWARDS: 'NO_REWARDS',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  INVALID_POOL: 'INVALID_POOL',
  NETWORK_ERROR: 'NETWORK_ERROR',
  USER_REJECTED: 'USER_REJECTED',
  INSUFFICIENT_GAS: 'INSUFFICIENT_GAS',
} as const;

export const STAKING_ERRORS: Record<string, StakingError> = {
  [STAKING_ERROR_CODES.WALLET_NOT_CONNECTED]: {
    code: STAKING_ERROR_CODES.WALLET_NOT_CONNECTED,
    message: 'Wallet not connected',
    userMessage: 'Please connect your wallet to continue with staking operations.',
  },
  [STAKING_ERROR_CODES.CONTRACT_NOT_DEPLOYED]: {
    code: STAKING_ERROR_CODES.CONTRACT_NOT_DEPLOYED,
    message: 'Staking contract not deployed',
    userMessage: 'Staking functionality is not yet available. Please check back later.',
  },
  [STAKING_ERROR_CODES.INSUFFICIENT_NFTS]: {
    code: STAKING_ERROR_CODES.INSUFFICIENT_NFTS,
    message: 'Insufficient NFTs in wallet',
    userMessage: 'You don\'t have enough NFTs in your wallet to complete this operation.',
  },
  [STAKING_ERROR_CODES.NO_NFTS_SELECTED]: {
    code: STAKING_ERROR_CODES.NO_NFTS_SELECTED,
    message: 'No NFTs selected for staking',
    userMessage: 'Please select at least one NFT to stake.',
  },
  [STAKING_ERROR_CODES.POOL_NOT_ACTIVE]: {
    code: STAKING_ERROR_CODES.POOL_NOT_ACTIVE,
    message: 'Staking pool is not active',
    userMessage: 'This staking pool is currently not accepting new stakes.',
  },
  [STAKING_ERROR_CODES.NFTS_LOCKED]: {
    code: STAKING_ERROR_CODES.NFTS_LOCKED,
    message: 'NFTs are still locked',
    userMessage: 'Your NFTs are still in the lock period and cannot be unstaked yet.',
  },
  [STAKING_ERROR_CODES.NO_REWARDS]: {
    code: STAKING_ERROR_CODES.NO_REWARDS,
    message: 'No rewards available to claim',
    userMessage: 'You don\'t have any rewards available to claim at this time.',
  },
  [STAKING_ERROR_CODES.TRANSACTION_FAILED]: {
    code: STAKING_ERROR_CODES.TRANSACTION_FAILED,
    message: 'Transaction failed',
    userMessage: 'The transaction failed to complete. Please try again.',
  },
  [STAKING_ERROR_CODES.APPROVAL_REQUIRED]: {
    code: STAKING_ERROR_CODES.APPROVAL_REQUIRED,
    message: 'NFT approval required',
    userMessage: 'You need to approve the staking contract to manage your NFTs first.',
  },
  [STAKING_ERROR_CODES.INVALID_POOL]: {
    code: STAKING_ERROR_CODES.INVALID_POOL,
    message: 'Invalid staking pool',
    userMessage: 'The selected staking pool is invalid or does not exist.',
  },
  [STAKING_ERROR_CODES.NETWORK_ERROR]: {
    code: STAKING_ERROR_CODES.NETWORK_ERROR,
    message: 'Network connection error',
    userMessage: 'Unable to connect to the blockchain. Please check your connection and try again.',
  },
  [STAKING_ERROR_CODES.USER_REJECTED]: {
    code: STAKING_ERROR_CODES.USER_REJECTED,
    message: 'User rejected transaction',
    userMessage: 'Transaction was cancelled. Please try again if you want to proceed.',
  },
  [STAKING_ERROR_CODES.INSUFFICIENT_GAS]: {
    code: STAKING_ERROR_CODES.INSUFFICIENT_GAS,
    message: 'Insufficient gas for transaction',
    userMessage: 'You don\'t have enough HYPE to pay for the transaction gas fees.',
  },
};

/**
 * Parse and categorize staking errors
 */
export function parseStakingError(error: any): StakingError {
  if (!error) {
    return STAKING_ERRORS[STAKING_ERROR_CODES.TRANSACTION_FAILED];
  }

  const errorMessage = error.message || error.toString();
  const errorCode = error.code;

  // Check for specific error patterns
  if (errorMessage.includes('user rejected') || errorCode === 4001) {
    return STAKING_ERRORS[STAKING_ERROR_CODES.USER_REJECTED];
  }

  if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient gas')) {
    return STAKING_ERRORS[STAKING_ERROR_CODES.INSUFFICIENT_GAS];
  }

  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return STAKING_ERRORS[STAKING_ERROR_CODES.NETWORK_ERROR];
  }

  if (errorMessage.includes('approval') || errorMessage.includes('allowance')) {
    return STAKING_ERRORS[STAKING_ERROR_CODES.APPROVAL_REQUIRED];
  }

  if (errorMessage.includes('locked') || errorMessage.includes('lock period')) {
    return STAKING_ERRORS[STAKING_ERROR_CODES.NFTS_LOCKED];
  }

  if (errorMessage.includes('pool') && errorMessage.includes('inactive')) {
    return STAKING_ERRORS[STAKING_ERROR_CODES.POOL_NOT_ACTIVE];
  }

  // Default to generic transaction failed error
  return {
    code: STAKING_ERROR_CODES.TRANSACTION_FAILED,
    message: errorMessage,
    userMessage: `Transaction failed: ${errorMessage}`,
  };
}

/**
 * Validate staking operation prerequisites
 */
export function validateStakingOperation(
  operation: 'stake' | 'unstake' | 'claim',
  params: {
    isConnected: boolean;
    contractsDeployed: boolean;
    selectedNFTs?: number[];
    poolActive?: boolean;
    hasRewards?: boolean;
    isLocked?: boolean;
  }
): StakingError | null {
  const { isConnected, contractsDeployed, selectedNFTs, poolActive, hasRewards, isLocked } = params;

  if (!isConnected) {
    return STAKING_ERRORS[STAKING_ERROR_CODES.WALLET_NOT_CONNECTED];
  }

  if (!contractsDeployed) {
    return STAKING_ERRORS[STAKING_ERROR_CODES.CONTRACT_NOT_DEPLOYED];
  }

  switch (operation) {
    case 'stake':
      if (!selectedNFTs || selectedNFTs.length === 0) {
        return STAKING_ERRORS[STAKING_ERROR_CODES.NO_NFTS_SELECTED];
      }
      if (poolActive === false) {
        return STAKING_ERRORS[STAKING_ERROR_CODES.POOL_NOT_ACTIVE];
      }
      break;

    case 'unstake':
      if (!selectedNFTs || selectedNFTs.length === 0) {
        return STAKING_ERRORS[STAKING_ERROR_CODES.NO_NFTS_SELECTED];
      }
      if (isLocked === true) {
        return STAKING_ERRORS[STAKING_ERROR_CODES.NFTS_LOCKED];
      }
      break;

    case 'claim':
      if (hasRewards === false) {
        return STAKING_ERRORS[STAKING_ERROR_CODES.NO_REWARDS];
      }
      break;
  }

  return null;
}

/**
 * Format error message for user display
 */
export function formatStakingError(error: StakingError): {
  title: string;
  message: string;
} {
  const titles: Record<string, string> = {
    [STAKING_ERROR_CODES.WALLET_NOT_CONNECTED]: 'Wallet Required',
    [STAKING_ERROR_CODES.CONTRACT_NOT_DEPLOYED]: 'Service Unavailable',
    [STAKING_ERROR_CODES.INSUFFICIENT_NFTS]: 'Insufficient NFTs',
    [STAKING_ERROR_CODES.NO_NFTS_SELECTED]: 'No NFTs Selected',
    [STAKING_ERROR_CODES.POOL_NOT_ACTIVE]: 'Pool Inactive',
    [STAKING_ERROR_CODES.NFTS_LOCKED]: 'NFTs Locked',
    [STAKING_ERROR_CODES.NO_REWARDS]: 'No Rewards',
    [STAKING_ERROR_CODES.TRANSACTION_FAILED]: 'Transaction Failed',
    [STAKING_ERROR_CODES.APPROVAL_REQUIRED]: 'Approval Required',
    [STAKING_ERROR_CODES.INVALID_POOL]: 'Invalid Pool',
    [STAKING_ERROR_CODES.NETWORK_ERROR]: 'Network Error',
    [STAKING_ERROR_CODES.USER_REJECTED]: 'Transaction Cancelled',
    [STAKING_ERROR_CODES.INSUFFICIENT_GAS]: 'Insufficient Gas',
  };

  return {
    title: titles[error.code] || 'Error',
    message: error.userMessage,
  };
}

/**
 * Get suggested actions for specific errors
 */
export function getErrorSuggestions(errorCode: string): string[] {
  const suggestions: Record<string, string[]> = {
    [STAKING_ERROR_CODES.WALLET_NOT_CONNECTED]: [
      'Connect your wallet using the connect button',
      'Make sure your wallet extension is installed and unlocked',
    ],
    [STAKING_ERROR_CODES.CONTRACT_NOT_DEPLOYED]: [
      'Check our social media for deployment updates',
      'Join our Discord for the latest announcements',
    ],
    [STAKING_ERROR_CODES.INSUFFICIENT_NFTS]: [
      'Purchase Hypercatz NFTs from the marketplace',
      'Check if you have NFTs in a different wallet',
    ],
    [STAKING_ERROR_CODES.NO_NFTS_SELECTED]: [
      'Click on NFTs to select them for staking',
      'Make sure you have NFTs available in your wallet',
    ],
    [STAKING_ERROR_CODES.POOL_NOT_ACTIVE]: [
      'Try a different staking pool',
      'Check back later when the pool becomes active',
    ],
    [STAKING_ERROR_CODES.NFTS_LOCKED]: [
      'Wait for the lock period to expire',
      'Check the pool details for unlock time',
    ],
    [STAKING_ERROR_CODES.NO_REWARDS]: [
      'Wait for rewards to accumulate over time',
      'Make sure you have NFTs staked in active pools',
    ],
    [STAKING_ERROR_CODES.TRANSACTION_FAILED]: [
      'Try the transaction again',
      'Check your wallet for any pending transactions',
    ],
    [STAKING_ERROR_CODES.APPROVAL_REQUIRED]: [
      'Approve the staking contract to manage your NFTs',
      'This is a one-time approval per collection',
    ],
    [STAKING_ERROR_CODES.NETWORK_ERROR]: [
      'Check your internet connection',
      'Try refreshing the page',
      'Switch to a different RPC endpoint if available',
    ],
    [STAKING_ERROR_CODES.USER_REJECTED]: [
      'Confirm the transaction in your wallet',
      'Make sure you want to proceed with the operation',
    ],
    [STAKING_ERROR_CODES.INSUFFICIENT_GAS]: [
      'Get more HYPE tokens to pay for gas fees',
      'Try the transaction when network fees are lower',
    ],
  };

  return suggestions[errorCode] || ['Please try again or contact support if the issue persists'];
}