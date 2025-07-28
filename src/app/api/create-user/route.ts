import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Address } from 'viem';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, hypeDomain } = (await req.json()) as { walletAddress: Address; hypeDomain?: string };

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Check if user already exists
    let { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingUser) {
      // User exists, just return their data
      return NextResponse.json({ user: existingUser, message: 'User already exists' });
    }
    
    // If user does not exist, proceed to create
    const refCode = req.cookies.get('hypercatz_ref')?.value;
    let referred_by = null;

    if (refCode) {
      // Find the referrer by their referral code
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', refCode)
        .single();
      
      if (referrer) {
        referred_by = referrer.id;
      }
    }

    // Create the new user
    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .insert({
        wallet_address: walletAddress,
        hype_domain: hypeDomain,
        referred_by: referred_by,
      })
      .select()
      .single();

    if (newUserError) {
      console.error('Error creating user:', newUserError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // If referred, create the referral record, which will trigger the count update
    if (referred_by && newUser) {
      await supabase.from('referrals').insert({
        referrer_id: referred_by,
        referred_id: newUser.id,
        referral_code: refCode!,
      });
    }

    // Create the response
    const response = NextResponse.json({ user: newUser, message: 'User created successfully' });

    // Clear the referral cookie after it's been used
    response.cookies.delete('hypercatz_ref');

    return response;

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}