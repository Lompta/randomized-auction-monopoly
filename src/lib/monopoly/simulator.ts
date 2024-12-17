// src/lib/monopoly/simulator.ts

import { MonopolyEngine } from './engine';

export interface SimulationResult {
  totalGames: number;
  wins: Record<string, number>;
  draws: number;
  averageGameLength: number;
  bankruptcyRates: Record<string, number>;
}

export class MonopolySimulator {
  constructor(
    private playerConditions: Record<string, { money: number; properties: string[] }>,
    private numGames: number = 100,
    private debug = false
  ) {}

  public runSimulation(): SimulationResult {
    const results: SimulationResult = {
      totalGames: this.numGames,
      wins: Object.fromEntries(Object.keys(this.playerConditions).map(p => [p, 0])),
      draws: 0,
      averageGameLength: 0,
      bankruptcyRates: Object.fromEntries(Object.keys(this.playerConditions).map(p => [p, 0]))
    };

    let totalTurns = 0;

    for (let i = 0; i < this.numGames; i++) {
      const engine = new MonopolyEngine(this.playerConditions, this.debug);
      const finalState = engine.simulateToEnd();

      // Record game length
      totalTurns += finalState.currentTurn;

      // Record winner
      if (finalState.winner === 'draw') {
        results.draws++;
      } else if (finalState.winner) {
        results.wins[finalState.winner]++;
      }

      // Record bankruptcies
      for (const bankrupt of finalState.bankruptPlayers) {
        results.bankruptcyRates[bankrupt]++;
      }
    }

    // Calculate averages
    results.averageGameLength = totalTurns / this.numGames;
    
    // Convert bankruptcy counts to rates
    for (const player in results.bankruptcyRates) {
      results.bankruptcyRates[player] = results.bankruptcyRates[player] / this.numGames;
    }

    return results;
  }
}