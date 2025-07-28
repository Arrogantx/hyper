import { HYPEREVM_CONFIG } from '@/lib/constants';

// RPC endpoint configuration with priority and health status
interface RPCEndpoint {
  url: string;
  priority: number;
  isHealthy: boolean;
  lastUsed: number;
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  corsSupported: boolean;
}

// Request queue item
interface QueuedRequest {
  id: string;
  method: string;
  params: any[];
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  retryCount: number;
}

// RPC Manager configuration
interface RPCManagerConfig {
  maxRequestsPerSecond: number;
  maxRetries: number;
  baseRetryDelay: number;
  maxRetryDelay: number;
  healthCheckInterval: number;
  requestTimeout: number;
  queueMaxSize: number;
}

class RPCManager {
  private endpoints: RPCEndpoint[] = [];
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private requestCounter = 0;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  private config: RPCManagerConfig = {
    maxRequestsPerSecond: 5, // More conservative rate limit to avoid 429 errors
    maxRetries: 4, // More retries for better reliability
    baseRetryDelay: 2000, // 2 seconds - longer initial delay
    maxRetryDelay: 15000, // 15 seconds max delay
    healthCheckInterval: 45000, // 45 seconds - less frequent health checks
    requestTimeout: 20000, // 20 seconds - longer timeout for unstaking
    queueMaxSize: 150, // Larger queue for high traffic
  };

  constructor() {
    this.initializeEndpoints();
    this.startHealthCheck();
  }

  private initializeEndpoints(): void {
    // Initialize RPC endpoints with priority and CORS support info
    const rpcUrls = [
      { url: 'https://rpc.hyperliquid.xyz/evm', priority: 1, corsSupported: true },
      { url: 'https://rpc.hyperlend.finance', priority: 2, corsSupported: true },
      { url: 'https://hyperliquid.drpc.org', priority: 3, corsSupported: true },
      { url: 'https://hyperliquid-mainnet.rpc.thirdweb.com', priority: 4, corsSupported: true },
      { url: 'https://api.hyperliquid.xyz/evm', priority: 5, corsSupported: true },
    ];

    this.endpoints = rpcUrls.map(endpoint => ({
      ...endpoint,
      isHealthy: true,
      lastUsed: 0,
      requestCount: 0,
      errorCount: 0,
      avgResponseTime: 0,
    }));

    // Sort by priority (lower number = higher priority)
    this.endpoints.sort((a, b) => a.priority - b.priority);
  }

  private async healthCheck(): Promise<void> {
    console.log('🔍 Running RPC health check...');
    
    const healthPromises = this.endpoints.map(async (endpoint) => {
      try {
        const startTime = Date.now();
        const response = await this.makeDirectRequest(endpoint.url, 'eth_blockNumber', [], 5000);
        const responseTime = Date.now() - startTime;
        
        endpoint.isHealthy = !!response.result;
        endpoint.avgResponseTime = (endpoint.avgResponseTime + responseTime) / 2;
        
        console.log(`✅ ${endpoint.url}: Healthy (${responseTime}ms)`);
      } catch (error) {
        endpoint.isHealthy = false;
        endpoint.errorCount++;
        console.log(`❌ ${endpoint.url}: Unhealthy - ${error}`);
      }
    });

    await Promise.allSettled(healthPromises);
    
    // Re-sort endpoints based on health and performance
    this.endpoints.sort((a, b) => {
      if (a.isHealthy !== b.isHealthy) {
        return a.isHealthy ? -1 : 1; // Healthy endpoints first
      }
      if (a.corsSupported !== b.corsSupported) {
        return a.corsSupported ? -1 : 1; // CORS-supported endpoints first
      }
      return a.avgResponseTime - b.avgResponseTime; // Faster endpoints first
    });
  }

  private startHealthCheck(): void {
    // Initial health check
    this.healthCheck();
    
    // Periodic health checks
    this.healthCheckTimer = setInterval(() => {
      this.healthCheck();
    }, this.config.healthCheckInterval);
  }

  private getNextEndpoint(): RPCEndpoint | null {
    // Find the best available endpoint
    const healthyEndpoints = this.endpoints.filter(ep => ep.isHealthy);
    
    if (healthyEndpoints.length === 0) {
      // If no healthy endpoints, try the least recently used unhealthy one
      return this.endpoints.reduce((prev, current) => 
        prev.lastUsed < current.lastUsed ? prev : current
      );
    }

    // Prefer CORS-supported endpoints
    const corsEndpoints = healthyEndpoints.filter(ep => ep.corsSupported);
    const targetEndpoints = corsEndpoints.length > 0 ? corsEndpoints : healthyEndpoints;

    // Use round-robin with load balancing
    return targetEndpoints.reduce((prev, current) => {
      const prevScore = prev.requestCount + (prev.errorCount * 2) + (prev.avgResponseTime / 100);
      const currentScore = current.requestCount + (current.errorCount * 2) + (current.avgResponseTime / 100);
      return currentScore < prevScore ? current : prev;
    });
  }

  private async makeDirectRequest(
    url: string, 
    method: string, 
    params: any[], 
    timeout: number = this.config.requestTimeout
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params,
          id: ++this.requestCounter,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`RPC Error: ${data.error.message} (${data.error.code})`);
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  private async throttleRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.config.maxRequestsPerSecond;

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      
      try {
        await this.throttleRequest();
        const result = await this.executeRequest(request.method, request.params);
        request.resolve(result);
      } catch (error) {
        if (request.retryCount < this.config.maxRetries) {
          // Retry with exponential backoff
          const delay = Math.min(
            this.config.baseRetryDelay * Math.pow(2, request.retryCount),
            this.config.maxRetryDelay
          );
          
          setTimeout(() => {
            request.retryCount++;
            this.requestQueue.unshift(request); // Add back to front of queue
          }, delay);
        } else {
          request.reject(error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  private async executeRequest(method: string, params: any[]): Promise<any> {
    const endpoint = this.getNextEndpoint();
    
    if (!endpoint) {
      throw new Error('No available RPC endpoints');
    }

    const startTime = Date.now();
    
    try {
      const result = await this.makeDirectRequest(endpoint.url, method, params);
      
      // Update endpoint stats
      endpoint.lastUsed = Date.now();
      endpoint.requestCount++;
      endpoint.avgResponseTime = (endpoint.avgResponseTime + (Date.now() - startTime)) / 2;
      
      return result;
    } catch (error: any) {
      endpoint.errorCount++;
      
      // Mark endpoint as unhealthy if too many errors
      if (endpoint.errorCount > 5) {
        endpoint.isHealthy = false;
      }
      
      // If CORS error, mark as not CORS supported
      if (error.message.includes('CORS') || error.message.includes('Access-Control-Allow-Origin')) {
        endpoint.corsSupported = false;
      }
      
      throw error;
    }
  }

  public async request(method: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check queue size limit
      if (this.requestQueue.length >= this.config.queueMaxSize) {
        reject(new Error('Request queue is full'));
        return;
      }

      const request: QueuedRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        method,
        params,
        resolve,
        reject,
        timestamp: Date.now(),
        retryCount: 0,
      };

      this.requestQueue.push(request);
      this.processQueue();
    });
  }

  public getEndpointStats(): RPCEndpoint[] {
    return this.endpoints.map(ep => ({ ...ep }));
  }

  public getQueueStatus(): { size: number; processing: boolean } {
    return {
      size: this.requestQueue.length,
      processing: this.isProcessingQueue,
    };
  }

  public destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    
    // Reject all pending requests
    this.requestQueue.forEach(request => {
      request.reject(new Error('RPC Manager destroyed'));
    });
    this.requestQueue = [];
  }
}

// Global RPC manager instance
let rpcManager: RPCManager | null = null;

export function getRPCManager(): RPCManager {
  if (!rpcManager) {
    rpcManager = new RPCManager();
  }
  return rpcManager;
}

// Convenience functions for common RPC calls
export async function rpcCall(method: string, params: any[] = []): Promise<any> {
  const manager = getRPCManager();
  return manager.request(method, params);
}

export async function getBlockNumber(): Promise<string> {
  const result = await rpcCall('eth_blockNumber');
  return result.result;
}

export async function getBalance(address: string, blockTag: string = 'latest'): Promise<string> {
  const result = await rpcCall('eth_getBalance', [address, blockTag]);
  return result.result;
}

export async function call(transaction: any, blockTag: string = 'latest'): Promise<string> {
  const result = await rpcCall('eth_call', [transaction, blockTag]);
  return result.result;
}

export async function sendTransaction(transaction: any): Promise<string> {
  const result = await rpcCall('eth_sendTransaction', [transaction]);
  return result.result;
}

export async function getTransactionReceipt(hash: string): Promise<any> {
  const result = await rpcCall('eth_getTransactionReceipt', [hash]);
  return result.result;
}

// Export types for external use
export type { RPCEndpoint, RPCManagerConfig };