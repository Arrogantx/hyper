-- Hypercatz Database Schema for Supabase
-- This file contains the complete database schema for the Hypercatz NFT DApp

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table for storing user profiles and wallet information
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT,
    email TEXT,
    avatar_url TEXT,
    tier TEXT DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
    total_points INTEGER DEFAULT 0,
    referral_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    referred_by UUID REFERENCES users(id),
    is_whitelisted BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFTs table for tracking owned NFTs
CREATE TABLE IF NOT EXISTS nfts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    token_id INTEGER NOT NULL,
    contract_address TEXT NOT NULL,
    owner_id UUID REFERENCES users(id),
    metadata_uri TEXT,
    name TEXT,
    description TEXT,
    image_url TEXT,
    attributes JSONB,
    rarity TEXT CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
    is_staked BOOLEAN DEFAULT FALSE,
    staked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(token_id, contract_address)
);

-- Add columns to users table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'referral_count') THEN
        ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'hype_domain') THEN
        ALTER TABLE users ADD COLUMN hype_domain TEXT;
    END IF;
END
$$;

-- Staking table for tracking staked assets
CREATE TABLE IF NOT EXISTS staking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    nft_id UUID REFERENCES nfts(id),
    token_amount DECIMAL(18, 8), -- For token staking
    stake_type TEXT NOT NULL CHECK (stake_type IN ('NFT', 'TOKEN')),
    rewards_earned DECIMAL(18, 8) DEFAULT 0,
    last_claim_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    staked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unstaked_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Points transactions for tracking point earnings and spending
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    amount INTEGER NOT NULL, -- Positive for earning, negative for spending
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('EARN', 'SPEND', 'BONUS', 'REFERRAL')),
    source TEXT NOT NULL, -- 'mint', 'stake', 'game', 'referral', 'purchase', etc.
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table for tracking game sessions
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_type TEXT NOT NULL CHECK (game_type IN ('FLIP', 'TICTACTOE', 'REACTION')),
    creator_id UUID REFERENCES users(id) NOT NULL,
    opponent_id UUID REFERENCES users(id),
    entry_fee DECIMAL(18, 8) DEFAULT 0,
    prize_pool DECIMAL(18, 8) DEFAULT 0,
    winner_id UUID REFERENCES users(id),
    game_state JSONB,
    status TEXT DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table for tracking referral relationships and rewards
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES users(id) NOT NULL,
    referred_id UUID REFERENCES users(id) NOT NULL,
    referral_code TEXT NOT NULL,
    reward_claimed BOOLEAN DEFAULT FALSE,
    reward_amount INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referrer_id, referred_id)
);

-- Reward store items
CREATE TABLE IF NOT EXISTS reward_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT CHECK (category IN ('WHITELIST', 'MERCHANDISE', 'ROLES', 'NFTS', 'TOKENS')),
    cost_points INTEGER NOT NULL,
    stock_quantity INTEGER DEFAULT -1, -- -1 for unlimited
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward purchases
CREATE TABLE IF NOT EXISTS reward_purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) NOT NULL,
    item_id UUID REFERENCES reward_items(id) NOT NULL,
    points_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FULFILLED', 'CANCELLED')),
    fulfillment_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fulfilled_at TIMESTAMP WITH TIME ZONE
);

-- Whitelist entries
CREATE TABLE IF NOT EXISTS whitelist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    mint_phase TEXT NOT NULL CHECK (mint_phase IN ('FREE', 'WHITELIST', 'PUBLIC')),
    max_mint_amount INTEGER DEFAULT 1,
    has_minted BOOLEAN DEFAULT FALSE,
    minted_amount INTEGER DEFAULT 0,
    added_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log for tracking user actions
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin settings
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_nfts_owner_id ON nfts(owner_id);
CREATE INDEX IF NOT EXISTS idx_nfts_token_id ON nfts(token_id, contract_address);
CREATE INDEX IF NOT EXISTS idx_staking_user_id ON staking(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_active ON staking(is_active);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_games_creator_id ON games(creator_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_wallet_address ON whitelist(wallet_address);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);

-- Create updated_at trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nfts_updated_at ON nfts;
CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON nfts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reward_items_updated_at ON reward_items;
CREATE TRIGGER update_reward_items_updated_at BEFORE UPDATE ON reward_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update referral count on new referral
DROP FUNCTION IF EXISTS update_referral_count() CASCADE;
CREATE OR REPLACE FUNCTION update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET referral_count = referral_count + 1
    WHERE id = NEW.referrer_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to execute the function
DROP TRIGGER IF EXISTS on_new_referral ON referrals;
CREATE TRIGGER on_new_referral
AFTER INSERT ON referrals
FOR EACH ROW
EXECUTE FUNCTION update_referral_count();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can view their own NFTs
DROP POLICY IF EXISTS "Users can view own NFTs" ON nfts;
CREATE POLICY "Users can view own NFTs" ON nfts FOR SELECT USING (auth.uid()::text = owner_id::text);

-- Users can view their own staking data
DROP POLICY IF EXISTS "Users can view own staking" ON staking;
CREATE POLICY "Users can view own staking" ON staking FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own point transactions
DROP POLICY IF EXISTS "Users can view own points" ON point_transactions;
CREATE POLICY "Users can view own points" ON point_transactions FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view games they're involved in
DROP POLICY IF EXISTS "Users can view own games" ON games;
CREATE POLICY "Users can view own games" ON games FOR SELECT USING (
    auth.uid()::text = creator_id::text OR auth.uid()::text = opponent_id::text
);

-- Users can view their own referrals
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (
    auth.uid()::text = referrer_id::text OR auth.uid()::text = referred_id::text
);

-- Users can view their own purchases
DROP POLICY IF EXISTS "Users can view own purchases" ON reward_purchases;
CREATE POLICY "Users can view own purchases" ON reward_purchases FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can view their own activity
DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
CREATE POLICY "Users can view own activity" ON activity_log FOR SELECT USING (auth.uid()::text = user_id::text);

-- Public read access for reward items and whitelist
DROP POLICY IF EXISTS "Public can view reward items" ON reward_items;
CREATE POLICY "Public can view reward items" ON reward_items FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Public can check whitelist" ON whitelist;
CREATE POLICY "Public can check whitelist" ON whitelist FOR SELECT USING (true);

-- Leaderboard view for ranking users
CREATE OR REPLACE VIEW leaderboard AS
    SELECT ROW_NUMBER() OVER (ORDER BY u.total_points DESC, u.created_at ASC) AS rank,
    u.id,
    u.wallet_address,
    u.hype_domain,
    u.username,
    u.total_points,
    u.referral_count,
    u.tier
   FROM users u
  WHERE u.is_banned = false
  ORDER BY u.total_points DESC, u.created_at;

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('mint_config', '{"phases": {"FREE": {"price": "0", "maxPerWallet": 1}, "WHITELIST": {"price": "0.01", "maxPerWallet": 3}, "PUBLIC": {"price": "0.02", "maxPerWallet": 5}}, "maxSupply": 10000}', 'Minting configuration'),
('staking_config', '{"baseRewardRate": "100", "tierMultipliers": {"Common": 1, "Rare": 1.5, "Epic": 2, "Legendary": 3}}', 'Staking reward configuration'),
('game_config', '{"entryFees": {"nftHolder": "0", "nonHolder": "2000000000000000000"}}', 'Game configuration'),
('point_rewards', '{"mint": 100, "stake": 50, "game_win": 200, "referral": 300, "daily_login": 25}', 'Point reward amounts')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default reward items
INSERT INTO reward_items (name, description, category, cost_points, image_url) VALUES
('Whitelist Spot', 'Guaranteed whitelist spot for next mint', 'WHITELIST', 1000, '/images/rewards/whitelist.png'),
('Hypercatz T-Shirt', 'Official Hypercatz merchandise', 'MERCHANDISE', 2500, '/images/rewards/tshirt.png'),
('Discord VIP Role', 'Exclusive VIP role in Discord', 'ROLES', 500, '/images/rewards/vip-role.png'),
('Rare NFT', 'Exclusive rare NFT for top holders', 'NFTS', 5000, '/images/rewards/rare-nft.png'),
('100 HYPE Tokens', 'Native HYPE token reward', 'TOKENS', 1500, '/images/rewards/hype-tokens.png')
ON CONFLICT DO NOTHING;