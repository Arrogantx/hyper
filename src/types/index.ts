import { Address } from 'viem';

// User and Wallet Types
export interface User {
  address: Address;
  isConnected: boolean;
  balance: string;
  hyeBalance: string;
  nftCount: number;
  isWhitelisted: boolean;
  referralCode?: string;
  totalReferred: number;
  badges: Badge[];
}

// NFT Types
export interface NFT {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  isStaked: boolean;
  stakingRewards?: string;
  stakingStartTime?: number;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  rarity?: number;
}

// Minting Types
export interface MintPhase {
  name: string;
  price: string;
  maxPerWallet: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  totalMinted: number;
  maxSupply: number;
}

export interface MintStatus {
  currentPhase: MintPhase | null;
  totalSupply: number;
  maxSupply: number;
  userMinted: number;
  canMint: boolean;
  mintPrice: string;
}

// Staking Types
export interface StakingInfo {
  totalStaked: number;
  totalRewards: string;
  stakingPower: number;
  multiplier: number;
  lastClaimTime: number;
  pendingRewards: string;
  stakedNFTs: NFT[];
}

export interface StakingPool {
  id: string;
  name: string;
  apy: number;
  lockPeriod: number;
  totalStaked: string;
  rewardToken: string;
  isActive: boolean;
}

// Game Types
export interface Game {
  id: string;
  name: string;
  type: 'COIN_FLIP' | 'TIC_TAC_TOE' | 'REACTION_RACE';
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  players: GamePlayer[];
  maxPlayers: number;
  entryFee: string;
  prize: string;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  winner?: Address;
}

export interface GamePlayer {
  address: Address;
  username?: string;
  isReady: boolean;
  score?: number;
  move?: string;
}

export interface GameStats {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  totalWinnings: string;
  winRate: number;
  favoriteGame: string;
}

// Reward Store Types
export interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  stock: number;
  category: 'access' | 'social' | 'boost' | 'nft' | 'merch';
  image?: string;
  isAvailable: boolean;
  cooldown?: number;
}

export interface UserRewards {
  points: number;
  totalEarned: number;
  totalSpent: number;
  purchaseHistory: RewardPurchase[];
}

export interface RewardPurchase {
  id: string;
  itemId: string;
  itemName: string;
  cost: number;
  purchasedAt: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedAt: number;
  progress?: BadgeProgress;
}

export interface BadgeProgress {
  current: number;
  required: number;
  percentage: number;
}

// Community Types
export interface ReferralStats {
  code: string;
  totalReferred: number;
  totalEarned: string;
  referrals: Referral[];
}

export interface Referral {
  address: Address;
  joinedAt: number;
  earned: string;
  isActive: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  address: Address;
  username?: string;
  score: number;
  category: 'staking' | 'games' | 'referrals' | 'overall';
}

// Swap Types
export interface Token {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balance?: string;
}

export interface SwapQuote {
  inputToken: Token;
  outputToken: Token;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  fee: string;
  route: string[];
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalNFTsMinted: number;
  totalStaked: string;
  totalGamesPlayed: number;
  totalRewardsDistributed: string;
  activeUsers24h: number;
}

export interface AdminAction {
  id: string;
  type: 'AIRDROP' | 'UPDATE_CONFIG' | 'PAUSE' | 'UNPAUSE';
  description: string;
  executedBy: Address;
  executedAt: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

// UI Component Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  glowEffect?: boolean;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: string;
  repeat?: boolean;
}

// Sound Types
export interface SoundConfig {
  enabled: boolean;
  volume: number;
  sounds: {
    click: string;
    success: string;
    error: string;
    mint: string;
    win: string;
    lose: string;
    notification: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Blockchain Types
export interface TransactionStatus {
  hash: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  confirmations: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
}

export interface ContractCall {
  address: Address;
  functionName: string;
  args: any[];
  value?: bigint;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  animations: {
    enabled: boolean;
    duration: number;
  };
  sounds: SoundConfig;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon?: string;
  badge?: string | number;
  isActive?: boolean;
  isDisabled?: boolean;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: { label: string; value: string }[];
}

// Utility Types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';