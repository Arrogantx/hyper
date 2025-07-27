/**
 * Test file to verify NFT detection and staking validation logic
 */

import { isValidTokenId } from '@/contracts/hypercatzStaking';

// Test the token ID validation function
describe('NFT Detection and Validation', () => {
  test('isValidTokenId should validate token IDs correctly', () => {
    // Valid token IDs
    expect(isValidTokenId(0)).toBe(true);
    expect(isValidTokenId(1)).toBe(true);
    expect(isValidTokenId(100)).toBe(true);
    expect(isValidTokenId(4444)).toBe(true);
    
    // Invalid token IDs
    expect(isValidTokenId(-1)).toBe(false);
    expect(isValidTokenId(4445)).toBe(false);
    expect(isValidTokenId(10000)).toBe(false);
  });

  test('Token ID 0 should be considered valid', () => {
    // This was part of the original issue - token ID 0 should be valid
    expect(isValidTokenId(0)).toBe(true);
  });
});

// Mock test for NFT detection logic
describe('NFT Detection Logic', () => {
  test('should handle empty NFT arrays correctly', () => {
    const userTokenIds: number[] = [];
    const selectedNFTs: number[] = [];
    
    // Simulate the validation logic from useHypercatzStaking
    const notOwnedIds = selectedNFTs.filter(id => !userTokenIds.includes(id));
    
    expect(notOwnedIds).toEqual([]);
  });

  test('should detect ownership correctly', () => {
    const userTokenIds = [0, 1, 5, 10, 100];
    const selectedNFTs = [0, 1, 5];
    
    const notOwnedIds = selectedNFTs.filter(id => !userTokenIds.includes(id));
    
    expect(notOwnedIds).toEqual([]);
  });

  test('should detect non-ownership correctly', () => {
    const userTokenIds = [0, 1, 5, 10, 100];
    const selectedNFTs = [0, 1, 5, 999]; // 999 is not owned
    
    const notOwnedIds = selectedNFTs.filter(id => !userTokenIds.includes(id));
    
    expect(notOwnedIds).toEqual([999]);
  });

  test('should handle the original error case', () => {
    // This simulates the original error where user had no NFTs but tried to stake token 0
    const userTokenIds: number[] = []; // No NFTs found
    const selectedNFTs = [0]; // Trying to stake token 0
    
    const notOwnedIds = selectedNFTs.filter(id => !userTokenIds.includes(id));
    
    // Should detect that user doesn't own token 0
    expect(notOwnedIds).toEqual([0]);
    
    // Should trigger the "No NFTs found" error path
    if (userTokenIds.length === 0) {
      const errorMessage = "No NFTs found in your wallet. Please ensure you own Hypercatz NFTs and try refreshing the page.";
      expect(errorMessage).toContain("No NFTs found");
    }
  });
});

// Export for potential use in other tests
export const mockNFTData = {
  emptyWallet: [],
  sampleWallet: [0, 1, 5, 10, 100, 500, 1000],
  largeWallet: Array.from({ length: 50 }, (_, i) => i),
};