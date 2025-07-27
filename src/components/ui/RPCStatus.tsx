'use client';

import { useState, useEffect } from 'react';
import { getRPCManager } from '@/utils/rpcManager';
import type { RPCEndpoint } from '@/utils/rpcManager';

interface RPCStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function RPCStatus({ showDetails = false, className = '' }: RPCStatusProps) {
  const [endpoints, setEndpoints] = useState<RPCEndpoint[]>([]);
  const [queueStatus, setQueueStatus] = useState({ size: 0, processing: false });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const rpcManager = getRPCManager();
      setEndpoints(rpcManager.getEndpointStats());
      setQueueStatus(rpcManager.getQueueStatus());
    };

    // Update immediately
    updateStatus();

    // Update every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const healthyEndpoints = endpoints.filter(ep => ep.isHealthy);
  const totalRequests = endpoints.reduce((sum, ep) => sum + ep.requestCount, 0);
  const totalErrors = endpoints.reduce((sum, ep) => sum + ep.errorCount, 0);
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

  const getStatusColor = () => {
    if (healthyEndpoints.length === 0) return 'text-red-400';
    if (healthyEndpoints.length < endpoints.length / 2) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusText = () => {
    if (healthyEndpoints.length === 0) return 'All RPCs Down';
    if (healthyEndpoints.length < endpoints.length / 2) return 'Limited Connectivity';
    return 'All Systems Operational';
  };

  if (!showDetails && healthyEndpoints.length === endpoints.length && queueStatus.size === 0) {
    return null; // Hide when everything is working fine
  }

  return (
    <div className={`rpc-status ${className}`}>
      {/* Compact Status Indicator */}
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsVisible(!isVisible)}
      >
        <div className={`w-2 h-2 rounded-full ${
          healthyEndpoints.length === 0 ? 'bg-red-400' :
          healthyEndpoints.length < endpoints.length / 2 ? 'bg-yellow-400' :
          'bg-green-400'
        } ${queueStatus.processing ? 'animate-pulse' : ''}`} />
        <span className={`text-xs font-mono ${getStatusColor()}`}>
          RPC: {healthyEndpoints.length}/{endpoints.length}
        </span>
        {queueStatus.size > 0 && (
          <span className="text-xs text-yellow-400 font-mono">
            Queue: {queueStatus.size}
          </span>
        )}
      </div>

      {/* Detailed Status Panel */}
      {(isVisible || showDetails) && (
        <div className="absolute top-8 right-0 bg-black/90 border border-cyan-500/30 rounded-lg p-4 min-w-80 z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-cyan-400 font-mono text-sm font-bold">RPC Status</h3>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-xs font-mono">
            <div>
              <div className="text-gray-400">Status</div>
              <div className={getStatusColor()}>{getStatusText()}</div>
            </div>
            <div>
              <div className="text-gray-400">Error Rate</div>
              <div className={errorRate > 10 ? 'text-red-400' : errorRate > 5 ? 'text-yellow-400' : 'text-green-400'}>
                {errorRate.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-400">Queue Size</div>
              <div className={queueStatus.size > 10 ? 'text-yellow-400' : 'text-gray-300'}>
                {queueStatus.size}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Processing</div>
              <div className={queueStatus.processing ? 'text-cyan-400' : 'text-gray-300'}>
                {queueStatus.processing ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Endpoint Details */}
          <div className="space-y-2">
            <div className="text-gray-400 text-xs font-mono mb-2">Endpoints:</div>
            {endpoints.map((endpoint, index) => (
              <div key={endpoint.url} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    endpoint.isHealthy ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <span className="text-gray-300 truncate max-w-48">
                    {endpoint.url.replace('https://', '')}
                  </span>
                  {endpoint.corsSupported && (
                    <span className="text-cyan-400 text-xs">CORS</span>
                  )}
                </div>
                <div className="flex gap-3 text-gray-400">
                  <span>{endpoint.requestCount}req</span>
                  <span>{endpoint.errorCount}err</span>
                  <span>{Math.round(endpoint.avgResponseTime)}ms</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-gray-700">
            <button
              onClick={() => {
                const rpcManager = getRPCManager();
                // Trigger a health check
                rpcManager.getEndpointStats();
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for accessing RPC status in components
export function useRPCStatus() {
  const [status, setStatus] = useState({
    healthy: 0,
    total: 0,
    queueSize: 0,
    processing: false,
    errorRate: 0,
  });

  useEffect(() => {
    const updateStatus = () => {
      const rpcManager = getRPCManager();
      const endpoints = rpcManager.getEndpointStats();
      const queueStatus = rpcManager.getQueueStatus();
      
      const healthy = endpoints.filter(ep => ep.isHealthy).length;
      const total = endpoints.length;
      const totalRequests = endpoints.reduce((sum, ep) => sum + ep.requestCount, 0);
      const totalErrors = endpoints.reduce((sum, ep) => sum + ep.errorCount, 0);
      const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

      setStatus({
        healthy,
        total,
        queueSize: queueStatus.size,
        processing: queueStatus.processing,
        errorRate,
      });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return status;
}