// Test script to verify token ID fetching logic
import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { HYPERCATZ_NFT_ADDRESS, HYPERCATZ_NFT_ABI } from '@/contracts/HypercatzNFT';

async function testTokenIdFetching() {
  console.log('Testing token ID fetching logic...');
  
  // Test address that owns token #0 (replace with actual test address)
  const testAddress = '0x1234567890123456789012345678901234567890'; // This should be replaced with actual address
  
  try {
    // Test 1: Check balance
    console.log('\n1. Testing balance check...');
    const balance = await readContract(config, {
      address: HYPERCATZ_NFT_ADDRESS,
      abi: HYPERCATZ_NFT_ABI,
      functionName: 'balanceOf',
      args: [testAddress],
    });
    console.log(`Balance: ${balance}`);
    
    if (Number(balance) > 0) {
      // Test 2: Try tokenOfOwnerByIndex
      console.log('\n2. Testing tokenOfOwnerByIndex...');
      try {
        const tokenId = await readContract(config, {
          address: HYPERCATZ_NFT_ADDRESS,
          abi: HYPERCATZ_NFT_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [testAddress, BigInt(0)],
        });
        console.log(`Token at index 0: #${tokenId}`);
      } catch (error) {
        console.log('tokenOfOwnerByIndex not supported, trying fallback method...');
        
        // Test 3: Check ownership of token #0
        console.log('\n3. Testing ownership of token #0...');
        try {
          const owner = await readContract(config, {
            address: HYPERCATZ_NFT_ADDRESS,
            abi: HYPERCATZ_NFT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(0)],
          });
          console.log(`Owner of token #0: ${owner}`);
          
          if ((owner as string).toLowerCase() === testAddress.toLowerCase()) {
            console.log('✅ User owns token #0');
          } else {
            console.log('❌ User does not own token #0');
          }
        } catch (ownerError) {
          console.log('Error checking ownership of token #0:', ownerError);
        }
      }
    } else {
      console.log('User has no NFTs');
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testTokenIdFetching().catch(console.error);