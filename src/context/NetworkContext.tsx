import React, { createContext, useContext } from 'react';
import { useNetworkStatus, NetworkStatus } from '../hooks/useNetworkStatus';

const NetworkContext = createContext<NetworkStatus>({
  isConnected: true,
  justReconnected: false,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const status = useNetworkStatus();
  return <NetworkContext.Provider value={status}>{children}</NetworkContext.Provider>;
}

export function useNetwork(): NetworkStatus {
  return useContext(NetworkContext);
}
