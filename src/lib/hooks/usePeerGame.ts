// src/lib/usePeerGame.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { PeerManager, GameMessage } from '../peerManager';

interface PeerGameState {
  isHost: boolean;
  roomCode: string | null;
  isConnected: boolean;
  error: string | null;
  connectedPlayers: string[];
}

export function usePeerGame() {
  const peerManagerRef = useRef<PeerManager | null>(null);
  const mountedRef = useRef(true);
  const [gameState, setGameState] = useState<PeerGameState>({
    isHost: false,
    roomCode: null,
    isConnected: false,
    error: null,
    connectedPlayers: []
  });

  useEffect(() => {
    mountedRef.current = true;
    
    if (!peerManagerRef.current) {
      peerManagerRef.current = new PeerManager();
    }

    return () => {
      mountedRef.current = false;
      if (peerManagerRef.current) {
        peerManagerRef.current.close();
        peerManagerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const manager = peerManagerRef.current;
    if (!manager) return;

    const handleMessage = (msg: GameMessage) => {
      if (!mountedRef.current) return;

      if (msg.type === 'PLAYER_JOIN') {
        setGameState(prev => ({
          ...prev,
          connectedPlayers: manager.getConnectedPlayers()
        }));
      }
    };

    const cleanup = manager.onMessage(handleMessage);
    return cleanup;
  }, []);

  const hostGame = useCallback(async () => {
    if (!peerManagerRef.current) {
      throw new Error('PeerManager not initialized');
    }

    try {
      const roomCode = await peerManagerRef.current.hostGame();
      if (mountedRef.current) {
        setGameState({
          isHost: true,
          roomCode,
          isConnected: true,
          error: null,
          connectedPlayers: []
        });
      }
      return roomCode;
    } catch (err) {
      if (mountedRef.current) {
        setGameState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to host game'
        }));
      }
      throw err;
    }
  }, []);

  const joinGame = useCallback(async (roomCode: string) => {
    if (!peerManagerRef.current) {
      throw new Error('PeerManager not initialized');
    }

    try {
      await peerManagerRef.current.joinGame(roomCode);
      if (mountedRef.current) {
        setGameState({
          isHost: false,
          roomCode,
          isConnected: true,
          error: null,
          connectedPlayers: []
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        setGameState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to join game'
        }));
      }
      throw err;
    }
  }, []);

  const sendMessage = useCallback((message: GameMessage) => {
    if (peerManagerRef.current) {
      peerManagerRef.current.broadcast(message);
    }
  }, []);

  const onMessage = useCallback((handler: (msg: GameMessage) => void) => {
    return peerManagerRef.current?.onMessage(handler) || (() => {});
  }, []);

  const setPeerName = useCallback((name: string) => {
    if (peerManagerRef.current) {
      peerManagerRef.current.setMyName(name);
    }
  }, []);

  return {
    ...gameState,
    hostGame,
    joinGame,
    sendMessage,
    onMessage,
    setPeerName,
  };
}