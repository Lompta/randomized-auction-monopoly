'use client'

import { useState } from 'react';
import LobbyScreen from '@/components/LobbyScreen';
import MonopolyAuction from '@/components/MonopolyAuction';
import { GameSettings, INITIAL_GAME_SETTINGS } from '@/lib/gameConstants';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>(INITIAL_GAME_SETTINGS);

  const handleGameReady = (hostStatus: boolean, settings: GameSettings) => {
    setIsHost(hostStatus);
    setGameSettings(settings);
    setGameStarted(true);
  };

  return (
    <main className="min-h-screen">
      {!gameStarted ? (
        <LobbyScreen onGameReady={handleGameReady} />
      ) : (
        <MonopolyAuction isHost={isHost} initialSettings={gameSettings} />
      )}
    </main>
  );
}