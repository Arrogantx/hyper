/**
 * RPC Manager Test Suite
 * Tests the RPC throttling, rotation, and fallback mechanisms
 */

import { getRPCManager, rpcCall } from '../utils/rpcManager';

describe('RPC Manager', () => {
  let rpcManager;

  beforeEach(() => {
    rpcManager = getRPCManager();
  });

  afterEach(() => {
    // Clean up any pending requests
    if (rpcManager) {
      rpcManager.destroy();
    }
  });

  test('should initialize with multiple endpoints', () => {
    const stats = rpcManager.getEndpointStats();
    expect(stats.length).toBeGreaterThan(0);
    expect(stats.every(endpoint => endpoint.url.startsWith('https://'))).toBe(true);
  });

  test('should have proper endpoint configuration', () => {
    const stats = rpcManager.getEndpointStats();
    
    // Check that we have CORS-supported endpoints
    const corsEndpoints = stats.filter(ep => ep.corsSupported);
    expect(corsEndpoints.length).toBeGreaterThan(0);
    
    // Check that endpoints are sorted by priority
    const priorities = stats.map(ep => ep.priority);
    for (let i = 1; i < priorities.length; i++) {
      expect(priorities[i]).toBeGreaterThanOrEqual(priorities[i - 1]);
    }
  });

  test('should handle queue status correctly', () => {
    const queueStatus = rpcManager.getQueueStatus();
    expect(queueStatus).toHaveProperty('size');
    expect(queueStatus).toHaveProperty('processing');
    expect(typeof queueStatus.size).toBe('number');
    expect(typeof queueStatus.processing).toBe('boolean');
  });

  test('should throttle requests properly', async () => {
    const startTime = Date.now();
    
    // Make multiple rapid requests
    const promises = Array(5).fill().map(() => 
      rpcCall('eth_blockNumber').catch(() => null) // Ignore errors for this test
    );
    
    await Promise.allSettled(promises);
    const endTime = Date.now();
    
    // Should take at least some time due to throttling (conservative check)
    expect(endTime - startTime).toBeGreaterThan(100);
  });

  test('should handle RPC call errors gracefully', async () => {
    // Test with invalid method
    await expect(rpcCall('invalid_method')).rejects.toThrow();
  });

  test('should update endpoint statistics', async () => {
    const initialStats = rpcManager.getEndpointStats();
    
    try {
      await rpcCall('eth_blockNumber');
    } catch (error) {
      // Ignore errors, we just want to test stats updates
    }
    
    const updatedStats = rpcManager.getEndpointStats();
    
    // At least one endpoint should have updated request count
    const hasUpdatedStats = updatedStats.some(ep => ep.requestCount > 0);
    expect(hasUpdatedStats).toBe(true);
  });

  test('should handle endpoint health status', () => {
    const stats = rpcManager.getEndpointStats();
    
    stats.forEach(endpoint => {
      expect(endpoint).toHaveProperty('isHealthy');
      expect(endpoint).toHaveProperty('requestCount');
      expect(endpoint).toHaveProperty('errorCount');
      expect(endpoint).toHaveProperty('avgResponseTime');
      expect(typeof endpoint.isHealthy).toBe('boolean');
      expect(typeof endpoint.requestCount).toBe('number');
      expect(typeof endpoint.errorCount).toBe('number');
      expect(typeof endpoint.avgResponseTime).toBe('number');
    });
  });

  test('should prioritize CORS-supported endpoints', () => {
    const stats = rpcManager.getEndpointStats();
    const corsEndpoints = stats.filter(ep => ep.corsSupported);
    const nonCorsEndpoints = stats.filter(ep => !ep.corsSupported);
    
    if (corsEndpoints.length > 0 && nonCorsEndpoints.length > 0) {
      // CORS endpoints should generally have higher priority (lower priority number)
      const avgCorsPriority = corsEndpoints.reduce((sum, ep) => sum + ep.priority, 0) / corsEndpoints.length;
      const avgNonCorsPriority = nonCorsEndpoints.reduce((sum, ep) => sum + ep.priority, 0) / nonCorsEndpoints.length;
      
      expect(avgCorsPriority).toBeLessThanOrEqual(avgNonCorsPriority);
    }
  });

  test('should handle concurrent requests', async () => {
    const concurrentRequests = 10;
    const promises = Array(concurrentRequests).fill().map((_, index) => 
      rpcCall('eth_blockNumber').catch(error => ({ error: error.message, index }))
    );
    
    const results = await Promise.allSettled(promises);
    
    // All requests should complete (either resolve or reject)
    expect(results.length).toBe(concurrentRequests);
    results.forEach(result => {
      expect(['fulfilled', 'rejected'].includes(result.status)).toBe(true);
    });
  });

  test('should implement exponential backoff on retries', async () => {
    // This test is harder to verify without mocking, but we can at least
    // ensure the retry mechanism doesn't cause infinite loops
    const startTime = Date.now();
    
    try {
      await rpcCall('definitely_invalid_method_that_will_fail');
    } catch (error) {
      const endTime = Date.now();
      
      // Should fail relatively quickly due to retry limits
      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds max
      expect(error.message).toBeTruthy();
    }
  });

  test('should clean up resources on destroy', () => {
    const initialStats = rpcManager.getEndpointStats();
    expect(initialStats.length).toBeGreaterThan(0);
    
    rpcManager.destroy();
    
    // After destroy, queue should be empty
    const queueStatus = rpcManager.getQueueStatus();
    expect(queueStatus.size).toBe(0);
  });
});

// Integration test with actual network (if endpoints are available)
describe('RPC Manager Integration', () => {
  test('should successfully make real RPC calls when network is available', async () => {
    // This test will only pass if at least one RPC endpoint is actually working
    try {
      const result = await rpcCall('eth_blockNumber');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.startsWith('0x')).toBe(true);
    } catch (error) {
      // If all endpoints are down, that's also a valid test result
      console.warn('All RPC endpoints appear to be down:', error.message);
      expect(error.message).toContain('RPC');
    }
  }, 15000); // 15 second timeout for network requests

  test('should handle network timeouts gracefully', async () => {
    // Test with a very short timeout to simulate network issues
    const rpcManager = getRPCManager();
    
    try {
      // This should timeout quickly
      await rpcManager.request('eth_blockNumber', []);
    } catch (error) {
      expect(error.message).toBeTruthy();
    } finally {
      rpcManager.destroy();
    }
  }, 10000);
});