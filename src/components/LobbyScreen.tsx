'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePeer } from '@/lib/peerContext';
import GameSettings, { GameSettings as GameSettingsType } from '@/components/GameSettings';
import { INITIAL_GAME_SETTINGS } from '@/lib/gameConstants';

interface LobbyScreenProps {
  onGameReady: (isHost: boolean, settings: GameSettingsType) => void;
}

const LobbyScreen = ({ onGameReady }: LobbyScreenProps) => {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [gameSettings, setGameSettings] = useState<GameSettingsType>(INITIAL_GAME_SETTINGS);
  
  const { 
    isHost,
    connectedPlayers,
    setPlayerName: setPeerPlayerName,
    hostGame,
    joinGame,
    peerManager
  } = usePeer();

  const isConnected = isHost || connectedPlayers.length > 0;

  const handleHostGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setStatus('Setting up host connection...');
    setError(null);
    
    try {
      setPeerPlayerName(playerName);
      const roomCode = await hostGame();
      setJoinCode(roomCode);
      setStatus('Connected! Waiting for players...');
      peerManager?.broadcast({ type: 'PLAYER_JOIN', name: playerName });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to host game');
      setStatus('');
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!joinCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setStatus('Connecting to game...');
    setError(null);
    
    try {
      setPeerPlayerName(playerName);
      await joinGame(joinCode);
      setStatus('Connected!');
      peerManager?.broadcast({ type: 'PLAYER_JOIN', name: playerName });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
      setStatus('');
    }
  };

  const handleStartGame = () => {
    if (connectedPlayers.length < 2) {
      setError('Need at least 2 players to start');
      return;
    }
    peerManager?.broadcast({ 
      type: 'GAME_START',
      settings: gameSettings 
    });
    onGameReady(isHost, gameSettings);
  };
  
  useEffect(() => {
    if (!peerManager) return;

    const handleMessage = (msg: any) => {
      if (msg.type === 'GAME_START' && msg.settings) {
        onGameReady(isHost, msg.settings);
      }
    };

    return peerManager.onMessage(handleMessage);
  }, [peerManager, isHost, onGameReady]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {isConnected 
              ? (isHost ? 'Waiting for Players' : 'Joining Game') 
              : 'Monopoly Auction'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {status && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{status}</span>
            </div>
          )}

          {!isConnected && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleHostGame}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={!playerName.trim() || !!status}
                >
                  Host New Game
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter room code"
                    disabled={!!status}
                  />
                  <button
                    onClick={handleJoinGame}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                    disabled={!playerName.trim() || !joinCode.trim() || !!status}
                  >
                    Join Game
                  </button>
                </div>
              </div>
            </>
          )}

          {isConnected && (
            <>
              {isHost && joinCode && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <p className="font-bold">Share this room code with other players:</p>
                  <p className="text-2xl text-center mt-2">{joinCode}</p>
                </div>
              )}

              {isHost && (
                <GameSettings
                  settings={gameSettings}
                  onSettingsChange={setGameSettings}
                  disabled={connectedPlayers.length === 0}
                />
              )}

              <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded relative">
                <div className="font-bold mb-1">Connected Players:</div>
                {connectedPlayers.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {connectedPlayers.map((player, index) => (
                      <li key={index}>{player}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic">Waiting for players to join...</p>
                )}
              </div>

              {isHost && connectedPlayers.length >= 2 && (
                <button
                  onClick={handleStartGame}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Start Game with {connectedPlayers.length} Players
                </button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LobbyScreen;