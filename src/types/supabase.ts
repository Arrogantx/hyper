export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          username: string | null
          email: string | null
          avatar_url: string | null
          tier: string
          total_points: number
          referral_code: string
          referred_by: string | null
          is_whitelisted: boolean
          is_banned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          tier?: string
          total_points?: number
          referral_code?: string
          referred_by?: string | null
          is_whitelisted?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          tier?: string
          total_points?: number
          referral_code?: string
          referred_by?: string | null
          is_whitelisted?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      nfts: {
        Row: {
          id: string
          token_id: number
          contract_address: string
          owner_id: string | null
          metadata_uri: string | null
          name: string | null
          description: string | null
          image_url: string | null
          attributes: Json | null
          rarity: string | null
          is_staked: boolean
          staked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          token_id: number
          contract_address: string
          owner_id?: string | null
          metadata_uri?: string | null
          name?: string | null
          description?: string | null
          image_url?: string | null
          attributes?: Json | null
          rarity?: string | null
          is_staked?: boolean
          staked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          token_id?: number
          contract_address?: string
          owner_id?: string | null
          metadata_uri?: string | null
          name?: string | null
          description?: string | null
          image_url?: string | null
          attributes?: Json | null
          rarity?: string | null
          is_staked?: boolean
          staked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfts_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      staking: {
        Row: {
          id: string
          user_id: string
          nft_id: string | null
          token_amount: number | null
          stake_type: string
          rewards_earned: number
          last_claim_at: string
          staked_at: string
          unstaked_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          nft_id?: string | null
          token_amount?: number | null
          stake_type: string
          rewards_earned?: number
          last_claim_at?: string
          staked_at?: string
          unstaked_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          nft_id?: string | null
          token_amount?: number | null
          stake_type?: string
          rewards_earned?: number
          last_claim_at?: string
          staked_at?: string
          unstaked_at?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "staking_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staking_nft_id_fkey"
            columns: ["nft_id"]
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          }
        ]
      }
      point_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: string
          source: string
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: string
          source: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: string
          source?: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      games: {
        Row: {
          id: string
          game_type: string
          creator_id: string
          opponent_id: string | null
          entry_fee: number
          prize_pool: number
          winner_id: string | null
          game_state: Json | null
          status: string
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          game_type: string
          creator_id: string
          opponent_id?: string | null
          entry_fee?: number
          prize_pool?: number
          winner_id?: string | null
          game_state?: Json | null
          status?: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          game_type?: string
          creator_id?: string
          opponent_id?: string | null
          entry_fee?: number
          prize_pool?: number
          winner_id?: string | null
          game_state?: Json | null
          status?: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_opponent_id_fkey"
            columns: ["opponent_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_winner_id_fkey"
            columns: ["winner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          referral_code: string
          reward_claimed: boolean
          reward_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          referral_code: string
          reward_claimed?: boolean
          reward_amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          referral_code?: string
          reward_claimed?: boolean
          reward_amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reward_items: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          category: string | null
          cost_points: number
          stock_quantity: number
          is_active: boolean
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          category?: string | null
          cost_points: number
          stock_quantity?: number
          is_active?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          category?: string | null
          cost_points?: number
          stock_quantity?: number
          is_active?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reward_purchases: {
        Row: {
          id: string
          user_id: string
          item_id: string
          points_spent: number
          status: string
          fulfillment_data: Json | null
          created_at: string
          fulfilled_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          points_spent: number
          status?: string
          fulfillment_data?: Json | null
          created_at?: string
          fulfilled_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          points_spent?: number
          status?: string
          fulfillment_data?: Json | null
          created_at?: string
          fulfilled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_purchases_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_purchases_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "reward_items"
            referencedColumns: ["id"]
          }
        ]
      }
      whitelist: {
        Row: {
          id: string
          wallet_address: string
          mint_phase: string
          max_mint_amount: number
          has_minted: boolean
          minted_amount: number
          added_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          mint_phase: string
          max_mint_amount?: number
          has_minted?: boolean
          minted_amount?: number
          added_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          mint_phase?: string
          max_mint_amount?: number
          has_minted?: boolean
          minted_amount?: number
          added_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whitelist_added_by_fkey"
            columns: ["added_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_log: {
        Row: {
          id: string
          user_id: string | null
          action_type: string
          description: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action_type: string
          description?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action_type?: string
          description?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          description: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          description?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          description?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_settings_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}