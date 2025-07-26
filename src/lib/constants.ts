// Blockchain Configuration
export const HYPEREVM_CHAIN_ID = 999;

export const HYPEREVM_CONFIG = {
  id: HYPEREVM_CHAIN_ID,
  name: 'HyperEVM',
  network: 'hyperevm',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    public: { http: ['https://rpc.hyperliquid.xyz/evm'] },
    default: { http: ['https://rpc.hyperliquid.xyz/evm'] },
  },
  blockExplorers: {
    default: { name: 'HyperEVM Explorer', url: 'https://hyperscan.com' },
  },
} as const;

// Contract Addresses (updated with deployed contracts)
export const CONTRACT_ADDRESSES = {
  HYPERCATZ_NFT: '0xa98F3CC961505CCcFB58AC58BC949a59dbdBe325',
  STAKING_CONTRACT: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS || '0x5b1F4087e322415489bFd41495aF32157bEC8f38',
  GAME_CONTRACT: process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
  REWARD_STORE: process.env.NEXT_PUBLIC_REWARD_STORE_ADDRESS || '0x0000000000000000000000000000000000000000',
  HYPE_TOKEN: process.env.NEXT_PUBLIC_HYPE_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
} as const;

// Mint Configuration
export const MINT_CONFIG = {
  MAX_SUPPLY: 4444,
  MAX_PER_WALLET: 2,
  MINT_START_DATE: '2025-07-25T00:00:00Z', // July 25th, 2025
  PHASES: {
    FREE: {
      price: '0',
      maxPerWallet: 1,
      startTime: new Date('2025-07-25T00:00:00Z').getTime() / 1000,
      endTime: new Date('2025-07-26T00:00:00Z').getTime() / 1000,
    },
    WHITELIST: {
      price: '0.01',
      maxPerWallet: 3,
      startTime: new Date('2025-07-26T00:00:00Z').getTime() / 1000,
      endTime: new Date('2025-07-28T00:00:00Z').getTime() / 1000,
    },
    PUBLIC: {
      price: '0.02',
      maxPerWallet: 5,
      startTime: new Date('2025-07-28T00:00:00Z').getTime() / 1000,
      endTime: 0, // No end time for public mint
    },
  },
} as const;

// Staking Configuration
export const STAKING_CONFIG = {
  BASE_REWARD_RATE: '100', // 100 points per day
  TIER_MULTIPLIERS: {
    COMMON: 1,
    RARE: 1.5,
    EPIC: 2,
    LEGENDARY: 3,
  },
  LOCK_PERIODS: {
    FLEXIBLE: 0, // No lock
    WEEK: 7 * 24 * 60 * 60, // 1 week in seconds
    MONTH: 30 * 24 * 60 * 60, // 1 month in seconds
    QUARTER: 90 * 24 * 60 * 60, // 3 months in seconds
  },
} as const;

// Game Configuration
export const GAME_CONFIG = {
  ENTRY_FEES: {
    NFT_HOLDER: '0', // Free for NFT holders
    NON_HOLDER: '2000000000000000000', // 2 HYPE in wei
  },
  GAMES: {
    COIN_FLIP: {
      name: 'Coin Flip',
      minPlayers: 2,
      maxPlayers: 2,
      duration: 30, // seconds
    },
    TIC_TAC_TOE: {
      name: 'Tic Tac Toe',
      minPlayers: 2,
      maxPlayers: 2,
      duration: 300, // 5 minutes
    },
    REACTION_RACE: {
      name: 'Reaction Race',
      minPlayers: 2,
      maxPlayers: 10,
      duration: 60, // 1 minute
    },
  },
} as const;

// Reward Store Configuration
export const REWARD_STORE_CONFIG = {
  ITEMS: {
    WHITELIST_SPOT: {
      name: 'Whitelist Spot',
      cost: 1000,
      stock: 100,
      category: 'access',
    },
    DISCORD_ROLE: {
      name: 'VIP Discord Role',
      cost: 500,
      stock: -1, // Unlimited
      category: 'social',
    },
    GAME_MULTIPLIER: {
      name: '2x Game Rewards',
      cost: 2000,
      stock: 50,
      category: 'boost',
    },
    RARE_NFT: {
      name: '1-of-1 NFT Drop',
      cost: 10000,
      stock: 1,
      category: 'nft',
    },
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  SOUND_ENABLED_DEFAULT: false,
  THEME: 'cyberpunk',
  MOBILE_BREAKPOINT: 768,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  METADATA: '/api/metadata',
  WHITELIST: '/api/whitelist',
  LEADERBOARD: '/api/leaderboard',
  REFERRALS: '/api/referrals',
  REWARDS: '/api/rewards',
} as const;

// Social Links
export const SOCIAL_LINKS = {
  DISCORD: 'https://discord.gg/hypercatz',
  TWITTER: 'https://twitter.com/hypercatz',
  WEBSITE: 'https://hypercatz.com',
  DOCS: 'https://docs.hypercatz.com',
} as const;

// Badge Types
export const BADGE_TYPES = {
  OG_MINTER: 'og_minter',
  GAME_MASTER: 'game_master',
  STAKING_CHAMP: 'staking_champ',
  REFERRER_KING: 'referrer_king',
  EARLY_BELIEVER: 'early_believer',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  TRANSACTION_FAILED: 'Transaction failed',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_INPUT: 'Invalid input provided',
  NOT_WHITELISTED: 'Address not whitelisted',
  MINT_NOT_ACTIVE: 'Minting is not currently active',
  MAX_SUPPLY_REACHED: 'Maximum supply reached',
  MAX_PER_WALLET_REACHED: 'Maximum per wallet reached',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  MINT_SUCCESS: 'NFT minted successfully!',
  STAKE_SUCCESS: 'Staking successful!',
  UNSTAKE_SUCCESS: 'Unstaking successful!',
  CLAIM_SUCCESS: 'Rewards claimed successfully!',
  GAME_WON: 'Congratulations! You won!',
  REWARD_REDEEMED: 'Reward redeemed successfully!',
} as const;