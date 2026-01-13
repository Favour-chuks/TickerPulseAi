
import React from 'react';
import { WifiOff, PlugZap } from 'lucide-react';
import { useConnectionStore } from '../store/connectionStore';

export const ConnectionBanner: React.FC = () => {
  const { isOnline, isSocketConnected } = useConnectionStore();

  if (isOnline && isSocketConnected) return null;

  return (
    <div className={`
      w-full px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold text-white uppercase tracking-wider
      ${!isOnline ? 'bg-rose-500' : 'bg-amber-500'}
    `}>
      {!isOnline ? (
        <>
          <WifiOff size={14} /> Offline Mode: Data will sync when connection is restored
        </>
      ) : (
        <>
          <PlugZap size={14} /> WebSocket Disconnected: Real-time updates paused
        </>
      )}
    </div>
  );
};
