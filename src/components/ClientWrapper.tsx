'use client';

import { PeerProvider } from '@/lib/peerContext';

export default function ClientWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <PeerProvider>
      {children}
    </PeerProvider>
  );
}