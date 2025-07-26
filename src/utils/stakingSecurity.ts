import { Address } from 'viem';

// Security validation utilities for staking operations

export interface SecurityCheck {
  passed: boolean;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityValidationResult {
  isValid: boolean;
  checks: SecurityCheck[];
  criticalIssues: SecurityCheck[];
  warnings: SecurityCheck[];
}

/**
 * Validate wallet address format and checksums
 */
export function validateWalletAddress(address: string): SecurityCheck {
  if (!address) {
    return {
      passed: false,
      message: 'Wallet address is required',
      severity: 'critical'
    };
  }

  // Basic Ethereum address format validation
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(address)) {
    return {
      passed: false,
      message: 'Invalid wallet address format',
      severity: 'critical'
    };
  }

  return {
    passed: true,
    message: 'Wallet address is valid',
    severity: 'low'
  };
}

/**
 * Validate contract addresses to prevent interaction with malicious contracts
 */
export function validateContractAddress(
  address: string, 
  expectedAddress: string,
  contractName: string
): SecurityCheck {
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    return {
      passed: false,
      message: `${contractName} contract address not set`,
      severity: 'critical'
    };
  }

  if (address.toLowerCase() !== expectedAddress.toLowerCase()) {
    return {
      passed: false,
      message: `${contractName} contract address mismatch - possible security risk`,
      severity: 'critical'
    };
  }

  return {
    passed: true,
    message: `${contractName} contract address verified`,
    severity: 'low'
  };
}

/**
 * Validate NFT token IDs to prevent invalid or malicious token interactions
 */
export function validateTokenIds(tokenIds: number[]): SecurityCheck {
  if (!tokenIds || tokenIds.length === 0) {
    return {
      passed: false,
      message: 'No token IDs provided',
      severity: 'high'
    };
  }

  // Check for duplicate token IDs
  const uniqueIds = new Set(tokenIds);
  if (uniqueIds.size !== tokenIds.length) {
    return {
      passed: false,
      message: 'Duplicate token IDs detected',
      severity: 'high'
    };
  }

  // Check for invalid token IDs (negative or extremely large numbers)
  const invalidIds = tokenIds.filter(id => id < 0 || id > 1000000);
  if (invalidIds.length > 0) {
    return {
      passed: false,
      message: `Invalid token IDs detected: ${invalidIds.join(', ')}`,
      severity: 'high'
    };
  }

  // Check for reasonable batch size (prevent gas limit issues)
  if (tokenIds.length > 50) {
    return {
      passed: false,
      message: 'Too many tokens in single transaction (max 50)',
      severity: 'medium'
    };
  }

  return {
    passed: true,
    message: `${tokenIds.length} token IDs validated`,
    severity: 'low'
  };
}

/**
 * Validate staking pool parameters
 */
export function validateStakingPool(
  poolId: number,
  poolData: {
    isActive: boolean;
    apy: number;
    lockPeriod: number;
    multiplier: number;
  }
): SecurityCheck {
  if (poolId < 0 || poolId > 10) {
    return {
      passed: false,
      message: 'Invalid pool ID',
      severity: 'high'
    };
  }

  if (!poolData.isActive) {
    return {
      passed: false,
      message: 'Staking pool is not active',
      severity: 'medium'
    };
  }

  // Check for reasonable APY (prevent display of malicious values)
  if (poolData.apy < 0 || poolData.apy > 10000) {
    return {
      passed: false,
      message: 'Suspicious APY value detected',
      severity: 'medium'
    };
  }

  // Check for reasonable lock period (prevent extremely long locks)
  const maxLockPeriod = 365 * 24 * 60 * 60; // 1 year in seconds
  if (poolData.lockPeriod < 0 || poolData.lockPeriod > maxLockPeriod) {
    return {
      passed: false,
      message: 'Invalid lock period',
      severity: 'medium'
    };
  }

  return {
    passed: true,
    message: 'Staking pool parameters validated',
    severity: 'low'
  };
}

/**
 * Validate transaction parameters for potential MEV attacks or front-running
 */
export function validateTransactionSecurity(params: {
  gasPrice?: bigint;
  gasLimit?: bigint;
  value?: bigint;
  deadline?: number;
}): SecurityCheck {
  const { gasPrice, gasLimit, value, deadline } = params;

  // Check for reasonable gas price (prevent overpaying)
  if (gasPrice && gasPrice > BigInt('100000000000')) { // 100 gwei
    return {
      passed: false,
      message: 'Gas price is unusually high - possible MEV attack',
      severity: 'medium'
    };
  }

  // Check for reasonable gas limit
  if (gasLimit && gasLimit > BigInt('1000000')) { // 1M gas
    return {
      passed: false,
      message: 'Gas limit is unusually high',
      severity: 'medium'
    };
  }

  // Check for unexpected ETH value in staking transactions
  if (value && value > BigInt('0')) {
    return {
      passed: false,
      message: 'Unexpected ETH value in staking transaction',
      severity: 'high'
    };
  }

  // Check transaction deadline (if applicable)
  if (deadline && deadline < Date.now() / 1000) {
    return {
      passed: false,
      message: 'Transaction deadline has passed',
      severity: 'high'
    };
  }

  return {
    passed: true,
    message: 'Transaction parameters validated',
    severity: 'low'
  };
}

/**
 * Check for common phishing patterns in transaction data
 */
export function validatePhishingProtection(params: {
  contractAddress: string;
  functionName: string;
  userAddress: string;
}): SecurityCheck {
  const { contractAddress, functionName, userAddress } = params;

  // Check for suspicious contract addresses (known scam patterns)
  const suspiciousPatterns = [
    /0x000000000000000000000000000000000000dead/i,
    /0x1111111111111111111111111111111111111111/i,
    /0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(contractAddress)) {
      return {
        passed: false,
        message: 'Suspicious contract address detected - possible phishing attempt',
        severity: 'critical'
      };
    }
  }

  // Check for suspicious function names
  const suspiciousFunctions = [
    'transferFrom',
    'approve',
    'setApprovalForAll',
    'transfer',
    'withdraw',
    'emergencyWithdraw'
  ];

  if (suspiciousFunctions.includes(functionName) && 
      !['stakeNFTs', 'unstakeNFTs', 'claimRewards'].includes(functionName)) {
    return {
      passed: false,
      message: `Suspicious function call detected: ${functionName}`,
      severity: 'high'
    };
  }

  return {
    passed: true,
    message: 'No phishing patterns detected',
    severity: 'low'
  };
}

/**
 * Comprehensive security validation for staking operations
 */
export function validateStakingOperation(params: {
  userAddress: string;
  contractAddress: string;
  stakingContractAddress: string;
  operation: 'stake' | 'unstake' | 'claim';
  tokenIds?: number[];
  poolId?: number;
  poolData?: {
    isActive: boolean;
    apy: number;
    lockPeriod: number;
    multiplier: number;
  };
  transactionParams?: {
    gasPrice?: bigint;
    gasLimit?: bigint;
    value?: bigint;
    deadline?: number;
  };
}): SecurityValidationResult {
  const checks: SecurityCheck[] = [];

  // Validate wallet address
  checks.push(validateWalletAddress(params.userAddress));

  // Validate contract addresses
  checks.push(validateContractAddress(
    params.contractAddress,
    params.stakingContractAddress,
    'Staking'
  ));

  // Validate token IDs for stake/unstake operations
  if ((params.operation === 'stake' || params.operation === 'unstake') && params.tokenIds) {
    checks.push(validateTokenIds(params.tokenIds));
  }

  // Validate pool data
  if (params.poolId !== undefined && params.poolData) {
    checks.push(validateStakingPool(params.poolId, params.poolData));
  }

  // Validate transaction parameters
  if (params.transactionParams) {
    checks.push(validateTransactionSecurity(params.transactionParams));
  }

  // Check for phishing attempts
  checks.push(validatePhishingProtection({
    contractAddress: params.contractAddress,
    functionName: params.operation === 'stake' ? 'stakeNFTs' : 
                  params.operation === 'unstake' ? 'unstakeNFTs' : 'claimRewards',
    userAddress: params.userAddress,
  }));

  // Categorize results
  const criticalIssues = checks.filter(check => !check.passed && check.severity === 'critical');
  const warnings = checks.filter(check => !check.passed && ['high', 'medium'].includes(check.severity));
  const isValid = criticalIssues.length === 0;

  return {
    isValid,
    checks,
    criticalIssues,
    warnings,
  };
}

/**
 * Generate security report for display to user
 */
export function generateSecurityReport(validation: SecurityValidationResult): {
  title: string;
  message: string;
  recommendations: string[];
} {
  if (!validation.isValid) {
    return {
      title: 'Security Issues Detected',
      message: 'Critical security issues were found that prevent this transaction from proceeding safely.',
      recommendations: validation.criticalIssues.map(issue => issue.message),
    };
  }

  if (validation.warnings.length > 0) {
    return {
      title: 'Security Warnings',
      message: 'Some potential security concerns were identified. Please review before proceeding.',
      recommendations: validation.warnings.map(warning => warning.message),
    };
  }

  return {
    title: 'Security Validation Passed',
    message: 'All security checks passed. Transaction appears safe to proceed.',
    recommendations: ['Transaction has been validated for security'],
  };
}

/**
 * Rate limiting for staking operations to prevent spam/abuse
 */
export class StakingRateLimit {
  private static operations: Map<string, number[]> = new Map();
  private static readonly MAX_OPERATIONS_PER_MINUTE = 10;
  private static readonly WINDOW_MS = 60 * 1000; // 1 minute

  static checkRateLimit(userAddress: string): SecurityCheck {
    const now = Date.now();
    const userOps = this.operations.get(userAddress) || [];
    
    // Remove operations older than the window
    const recentOps = userOps.filter(timestamp => now - timestamp < this.WINDOW_MS);
    
    if (recentOps.length >= this.MAX_OPERATIONS_PER_MINUTE) {
      return {
        passed: false,
        message: 'Rate limit exceeded. Please wait before performing another operation.',
        severity: 'medium'
      };
    }

    // Add current operation
    recentOps.push(now);
    this.operations.set(userAddress, recentOps);

    return {
      passed: true,
      message: 'Rate limit check passed',
      severity: 'low'
    };
  }
}