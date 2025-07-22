import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database utility functions
export const db = {
  // User operations
  users: {
    async getByWallet(walletAddress: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async create(userData: {
      wallet_address: string;
      username?: string;
      email?: string;
      referred_by?: string;
    }) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          wallet_address: userData.wallet_address.toLowerCase(),
          username: userData.username,
          email: userData.email,
          referred_by: userData.referred_by,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async updatePoints(userId: string, points: number) {
      const { data, error } = await supabase
        .from('users')
        .update({ total_points: points })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getLeaderboard(limit = 10) {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, wallet_address, total_points, tier')
        .order('total_points', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
  },

  // NFT operations
  nfts: {
    async getByOwner(ownerId: string) {
      const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('owner_id', ownerId);
      
      if (error) throw error;
      return data;
    },

    async create(nftData: {
      token_id: number;
      contract_address: string;
      owner_id: string;
      metadata_uri?: string;
      name?: string;
      description?: string;
      image_url?: string;
      attributes?: any;
      rarity?: string;
    }) {
      const { data, error } = await supabase
        .from('nfts')
        .insert(nftData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async updateStakeStatus(tokenId: number, contractAddress: string, isStaked: boolean) {
      const { data, error } = await supabase
        .from('nfts')
        .update({ 
          is_staked: isStaked,
          staked_at: isStaked ? new Date().toISOString() : null
        })
        .eq('token_id', tokenId)
        .eq('contract_address', contractAddress)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },

  // Staking operations
  staking: {
    async getByUser(userId: string) {
      const { data, error } = await supabase
        .from('staking')
        .select(`
          *,
          nfts (*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },

    async create(stakingData: {
      user_id: string;
      nft_id?: string;
      token_amount?: number;
      stake_type: 'NFT' | 'TOKEN';
    }) {
      const { data, error } = await supabase
        .from('staking')
        .insert(stakingData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async updateRewards(stakingId: string, rewardsEarned: number) {
      const { data, error } = await supabase
        .from('staking')
        .update({ 
          rewards_earned: rewardsEarned,
          last_claim_at: new Date().toISOString()
        })
        .eq('id', stakingId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async unstake(stakingId: string) {
      const { data, error } = await supabase
        .from('staking')
        .update({ 
          is_active: false,
          unstaked_at: new Date().toISOString()
        })
        .eq('id', stakingId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },

  // Point transactions
  points: {
    async addTransaction(transactionData: {
      user_id: string;
      amount: number;
      transaction_type: 'EARN' | 'SPEND' | 'BONUS' | 'REFERRAL';
      source: string;
      description?: string;
      metadata?: any;
    }) {
      const { data, error } = await supabase
        .from('point_transactions')
        .insert(transactionData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getByUser(userId: string, limit = 50) {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
  },

  // Games operations
  games: {
    async create(gameData: {
      game_type: 'FLIP' | 'TICTACTOE' | 'REACTION';
      creator_id: string;
      entry_fee?: number;
      prize_pool?: number;
    }) {
      const { data, error } = await supabase
        .from('games')
        .insert(gameData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async join(gameId: string, opponentId: string) {
      const { data, error } = await supabase
        .from('games')
        .update({ 
          opponent_id: opponentId,
          status: 'ACTIVE',
          started_at: new Date().toISOString()
        })
        .eq('id', gameId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async updateState(gameId: string, gameState: any) {
      const { data, error } = await supabase
        .from('games')
        .update({ game_state: gameState })
        .eq('id', gameId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async complete(gameId: string, winnerId: string) {
      const { data, error } = await supabase
        .from('games')
        .update({ 
          winner_id: winnerId,
          status: 'COMPLETED',
          completed_at: new Date().toISOString()
        })
        .eq('id', gameId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getActive(limit = 20) {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          creator:users!creator_id (username, wallet_address),
          opponent:users!opponent_id (username, wallet_address)
        `)
        .in('status', ['WAITING', 'ACTIVE'])
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
  },

  // Referrals operations
  referrals: {
    async create(referrerCode: string, referredId: string) {
      // First get the referrer by code
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referrerCode)
        .single();
      
      if (referrerError) throw referrerError;

      const { data, error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_id: referredId,
          referral_code: referrerCode,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getByReferrer(referrerId: string) {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:users!referred_id (username, wallet_address, created_at)
        `)
        .eq('referrer_id', referrerId);
      
      if (error) throw error;
      return data;
    },

    async claimReward(referralId: string, rewardAmount: number) {
      const { data, error } = await supabase
        .from('referrals')
        .update({ 
          reward_claimed: true,
          reward_amount: rewardAmount
        })
        .eq('id', referralId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },

  // Whitelist operations
  whitelist: {
    async check(walletAddress: string) {
      const { data, error } = await supabase
        .from('whitelist')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async add(walletAddress: string, mintPhase: 'FREE' | 'WHITELIST' | 'PUBLIC', maxMintAmount = 1) {
      const { data, error } = await supabase
        .from('whitelist')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          mint_phase: mintPhase,
          max_mint_amount: maxMintAmount,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async updateMintStatus(walletAddress: string, mintedAmount: number) {
      const { data, error } = await supabase
        .from('whitelist')
        .update({ 
          has_minted: true,
          minted_amount: mintedAmount
        })
        .eq('wallet_address', walletAddress.toLowerCase())
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  },

  // Reward store operations
  rewards: {
    async getItems() {
      const { data, error } = await supabase
        .from('reward_items')
        .select('*')
        .eq('is_active', true)
        .order('cost_points', { ascending: true });
      
      if (error) throw error;
      return data;
    },

    async purchase(userId: string, itemId: string, pointsSpent: number) {
      const { data, error } = await supabase
        .from('reward_purchases')
        .insert({
          user_id: userId,
          item_id: itemId,
          points_spent: pointsSpent,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getPurchases(userId: string) {
      const { data, error } = await supabase
        .from('reward_purchases')
        .select(`
          *,
          reward_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  },

  // Activity logging
  activity: {
    async log(activityData: {
      user_id?: string;
      action_type: string;
      description?: string;
      metadata?: any;
      ip_address?: string;
      user_agent?: string;
    }) {
      const { data, error } = await supabase
        .from('activity_log')
        .insert(activityData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getByUser(userId: string, limit = 50) {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
  },

  // Admin operations
  admin: {
    async getSettings() {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');
      
      if (error) throw error;
      return data;
    },

    async updateSetting(key: string, value: any) {
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getStats() {
      // Get comprehensive stats for admin dashboard
      const [
        { count: totalUsers },
        { count: totalNFTs },
        { count: activeStaking },
        { count: totalGames },
        { count: totalReferrals }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('nfts').select('*', { count: 'exact', head: true }),
        supabase.from('staking').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('games').select('*', { count: 'exact', head: true }),
        supabase.from('referrals').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalNFTs: totalNFTs || 0,
        activeStaking: activeStaking || 0,
        totalGames: totalGames || 0,
        totalReferrals: totalReferrals || 0,
      };
    },
  },
};

// Real-time subscriptions
export const subscriptions = {
  games: (callback: (payload: any) => void) => {
    return supabase
      .channel('games')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, callback)
      .subscribe();
  },

  userPoints: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`user_points_${userId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'users',
        filter: `id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  staking: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`staking_${userId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'staking',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },
};

export default supabase;