import { useEffect, useRef, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export type NetworkStatus = {
  isConnected: boolean;
  justReconnected: boolean;
};

export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const prevConnected = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;
      const wasOffline = !prevConnected.current;

      setIsConnected(connected);

      if (wasOffline && connected) {
        setJustReconnected(true);
        setTimeout(() => setJustReconnected(false), 100);
      }

      prevConnected.current = connected;
    });

    return unsubscribe;
  }, []);

  return { isConnected, justReconnected };
}
