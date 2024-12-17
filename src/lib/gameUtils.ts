import { GameState } from '@/lib/gameConstants';

export function calculateHighestBid(gameState: GameState): number {
  return Math.max(...Object.values(gameState.currentBids), 0);
}

export function getPlayerMoney(gameState: GameState, playerName: string): number {
  return gameState.players[playerName]?.money ?? 0;
}

export function isPlayerTurn(
  currentPlayerIndex: number,
  connectedPlayers: string[],
  myName?: string
): boolean {
  return connectedPlayers[currentPlayerIndex] === myName;
}