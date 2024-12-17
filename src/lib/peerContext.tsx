// src/lib/peerContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { PeerManager } from './peerManager';

interface PeerContextType {
  peerManager: PeerManager | null;
  isHost: boolean;
  connectedPlayers: string[];
  setPlayerName: (name: string) => void;
  hostGame: () => Promise<string>;
  joinGame: (roomCode: string) => Promise<void>;
  gameStarted: boolean;
  setGameStarted: (started: boolean) => void;
}

const PeerContext = createContext<PeerContextType | null>(null);

export function PeerProvider({ children }: { children: React.ReactNode }) {
  const peerManagerRef = useRef<PeerManager | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  // Using ref to avoid recreating PeerManager unnecessarily
  useEffect(() => {
    if (!peerManagerRef.current) {
      console.log('Creating new PeerManager');
      peerManagerRef.current = new PeerManager();
    }

    const manager = peerManagerRef.current;

    return () => {
      // Only close if component is truly unmounting
      if (!document.body.contains(document.getElementById('__next'))) {
        console.log('Truly unmounting, closing peer manager');
        manager.close();
        peerManagerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const manager = peerManagerRef.current;
    if (!manager) return;

    const handleMessage = (msg: any) => {
      console.log('PeerContext received message:', msg);
      if (msg.type === 'PLAYER_LIST') {
        setConnectedPlayers(msg.players);
      } else if (msg.type === 'PLAYER_JOIN') {
        setConnectedPlayers(prev => {
          if (!prev.includes(msg.name)) {
            return [...prev, msg.name];
          }
          return prev;
        });
      } else if (msg.type === 'GAME_START') {
        setGameStarted(true);
      }
    };

    const unsubscribe = manager.onMessage(handleMessage);
    return () => unsubscribe();
  }, []);

  const setPlayerName = useCallback((name: string) => {
    if (!peerManagerRef.current) return;
    peerManagerRef.current.setMyName(name);
    if (!connectedPlayers.includes(name)) {
      setConnectedPlayers(prev => [...prev, name]);
    }
  }, [connectedPlayers]);

  const hostGame = useCallback(async () => {
    if (!peerManagerRef.current) throw new Error('PeerManager not initialized');
    const roomCode = await peerManagerRef.current.hostGame();
    setIsHost(true);
    return roomCode;
  }, []);

  const joinGame = useCallback(async (roomCode: string) => {
    if (!peerManagerRef.current) throw new Error('PeerManager not initialized');
    await peerManagerRef.current.joinGame(roomCode);
    setIsHost(false);
  }, []);

  return (
    <PeerContext.Provider 
      value={{
        peerManager: peerManagerRef.current,
        isHost,
        connectedPlayers,
        setPlayerName,
        hostGame,
        joinGame,
        gameStarted,
        setGameStarted
      }}
    >
      {children}
    </PeerContext.Provider>
  );
}

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error('usePeer must be used within a PeerProvider');
  }
  return context;
};