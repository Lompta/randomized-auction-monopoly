import { useState, useEffect } from 'react';
import { usePeer } from '@/lib/peerContext';
import { GameState, INITIAL_GAME_STATE, INITIAL_MONEY, GameSettings } from '@/lib/gameConstants';
import { PROPERTIES } from '../monopoly/board';

export function useAuctionState(isHost: boolean, initialSettings: GameSettings) {
  const { peerManager, connectedPlayers } = usePeer();
  const [gameState, setGameState] = useState<GameState>({
    ...INITIAL_GAME_STATE,
    settings: initialSettings
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const safeSetGameState = (newState: GameState) => {
    if (!newState.players || !newState.properties) {
      console.error('Invalid game state update attempted');
      return;
    }
    setGameState(newState);
  };

  useEffect(() => {
    if (isHost && connectedPlayers.length > 0) {
      const initialPlayers = Object.fromEntries(
        connectedPlayers.map(name => [name, { money: INITIAL_MONEY, properties: [] }])
      );
      
      const shuffledProperties = [...PROPERTIES].sort(() => Math.random() - 0.5);
      
      const newState: GameState = {
        ...INITIAL_GAME_STATE,
        settings: initialSettings,
        players: initialPlayers,
        currentProperty: shuffledProperties[0],
        properties: shuffledProperties,
      };

      safeSetGameState(newState);
      peerManager?.broadcast({ type: 'GAME_STATE', state: newState });
    }
  }, [isHost, connectedPlayers, peerManager]); // Removed initialSettings from deps

  return {
    gameState,
    setGameState: safeSetGameState,
    showAlert,
    setShowAlert,
    alertMessage,
    setAlertMessage,
    isSimulating,
    setIsSimulating
  };
}