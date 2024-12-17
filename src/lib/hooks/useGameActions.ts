// @ts-nocheck
import { runSimulation } from '@/lib/simulationUtils';
import { GameState, AuctionResult } from '@/lib/gameConstants';
import { PeerManager } from '@/lib/peerManager';

interface GameActions {
  handleBid: (amount: number, player: string) => void;
  handlePass: (player: string) => void;
  finishAuction: () => void;
  submitGameToServer: () => Promise<void>;
}

export function useGameActions(
  isHost: boolean,
  gameState: GameState,
  setGameState: (state: GameState) => void,
  peerManager: PeerManager | null,
  connectedPlayers: string[],
  setIsSimulating: (value: boolean) => void,
  setAlertMessage: (message: string) => void,
  setShowAlert: (show: boolean) => void
): GameActions {

  const handleBid = (amount: number, player: string) => {
    if (!isHost || !gameState.currentProperty) return;

    const playerState = gameState.players[player];
    if (!playerState || amount > playerState.money) return;

    if (gameState.settings.simultaneousMode) {
      const newState: GameState = {
        ...gameState,
        currentBids: { ...gameState.currentBids, [player]: amount },
        biddingComplete: { ...gameState.biddingComplete, [player]: true }
      };

      // Check if this was the last bid
      const allBidsIn = Object.keys(gameState.players)
        .every(p => newState.biddingComplete[p]);

      // Update state first
      setGameState(newState);
      peerManager?.broadcast({ type: 'GAME_STATE', state: newState });

      // Only evaluate winner after state is updated with all bids
      if (allBidsIn) {
        // Use newState instead of gameState to get the final bid
        const highestBid = Math.max(...Object.values(newState.currentBids), 0);
        const highestBidders = Object.entries(newState.currentBids)
          .filter(([_, bid]) => bid === highestBid)
          .map(([player]) => player);

        // In case of tie, take the first player who bid that amount
        const winner = highestBidders[0];
        
        // Now we process the auction result with the correct winner
        const newPlayers = { ...newState.players };
        const newUnownedProperties = [...(newState.unownedProperties || [])];

        // Record auction result
        const auctionResult: AuctionResult = {
          property: newState.currentProperty,
          winner: winner || 'No Winner',
          amount: highestBid,
          allBids: { ...newState.currentBids }
        };

        if (winner && highestBid > 0) {
          newPlayers[winner] = {
            ...newPlayers[winner],
            money: newPlayers[winner].money - highestBid,
            properties: [...newPlayers[winner].properties, newState.currentProperty]
          };
        } else {
          newUnownedProperties.push(newState.currentProperty);
        }

        const nextProperties = newState.properties.slice(1);
        
        if (nextProperties.length === 0) {
          const finalState: GameState = {
            ...newState,
            stage: 'results',
            players: newPlayers,
            currentBids: {},
            biddingComplete: {},
            consecutivePasses: 0,
            currentProperty: null,
            unownedProperties: newUnownedProperties,
            auctionHistory: [...newState.auctionHistory, auctionResult]
          };
          
          setGameState(finalState);
          peerManager?.broadcast({ type: 'GAME_STATE', state: finalState });
          submitGameToServer();
        } else {
          const nextState: GameState = {
            ...newState,
            players: newPlayers,
            properties: nextProperties,
            currentProperty: nextProperties[0],
            currentBids: {},
            biddingComplete: {},
            consecutivePasses: 0,
            currentPlayerIndex: 0,
            unownedProperties: newUnownedProperties,
            auctionHistory: [...newState.auctionHistory, auctionResult]
          };
          setGameState(nextState);
          peerManager?.broadcast({ type: 'GAME_STATE', state: nextState });
        }
      }
    } else {
      // Sequential mode stays the same
      const highestBid = Math.max(...Object.values(gameState.currentBids), 0);
      if (amount <= highestBid) return;

      const newState: GameState = {
        ...gameState,
        currentBids: { ...gameState.currentBids, [player]: amount },
        consecutivePasses: 0,
        currentPlayerIndex: (gameState.currentPlayerIndex + 1) % connectedPlayers.length
      };

      setGameState(newState);
      peerManager?.broadcast({ type: 'GAME_STATE', state: newState });
    }
  };

  const handlePass = (player: string) => {
    if (!isHost || !gameState.currentProperty) return;

    if (gameState.settings.simultaneousMode) {
      const newState: GameState = {
        ...gameState,
        currentBids: { ...gameState.currentBids, [player]: 0 },
        biddingComplete: { ...gameState.biddingComplete, [player]: true }
      };

      const allBidsIn = Object.keys(gameState.players)
        .every(p => newState.biddingComplete[p]);

      setGameState(newState);
      peerManager?.broadcast({ type: 'GAME_STATE', state: newState });

      if (allBidsIn) {
        handleBid(0, player); // Reuse the bid handling logic for auction completion
      }
    } else {
      const newPassCount = gameState.consecutivePasses + 1;
      const hasBids = Object.values(gameState.currentBids).some(bid => bid > 0);
      const auctionEnds = hasBids 
        ? newPassCount >= connectedPlayers.length - 1
        : newPassCount >= connectedPlayers.length;

      if (auctionEnds) {
        finishAuction();
      } else {
        const newState: GameState = {
          ...gameState,
          consecutivePasses: newPassCount,
          currentPlayerIndex: (gameState.currentPlayerIndex + 1) % connectedPlayers.length
        };
        
        setGameState(newState);
        peerManager?.broadcast({ type: 'GAME_STATE', state: newState });
      }
    }
  };

  const finishAuction = () => {
    if (!isHost || !gameState.currentProperty) return;

    const highestBid = Math.max(...Object.values(gameState.currentBids), 0);
    const winner = Object.entries(gameState.currentBids)
      .find(([_, bid]) => bid === highestBid)?.[0];

    const newPlayers = { ...gameState.players };
    const newUnownedProperties = [...(gameState.unownedProperties || [])];

    // Record auction result
    const auctionResult: AuctionResult = {
      property: gameState.currentProperty,
      winner: winner || 'No Winner',
      amount: highestBid,
      allBids: { ...gameState.currentBids }
    };

    if (winner && highestBid > 0) {
      newPlayers[winner] = {
        ...newPlayers[winner],
        money: newPlayers[winner].money - highestBid,
        properties: [...newPlayers[winner].properties, gameState.currentProperty]
      };
    } else {
      newUnownedProperties.push(gameState.currentProperty);
    }

    const nextProperties = gameState.properties.slice(1);
    
    if (nextProperties.length === 0) {
      const finalState: GameState = {
        ...gameState,
        stage: 'results',
        players: newPlayers,
        currentBids: {},
        biddingComplete: {},
        consecutivePasses: 0,
        currentProperty: null,
        unownedProperties: newUnownedProperties,
        auctionHistory: [...gameState.auctionHistory, auctionResult]
      };
      
      setGameState(finalState);
      peerManager?.broadcast({ type: 'GAME_STATE', state: finalState });
      submitGameToServer();
    } else {
      const nextState: GameState = {
        ...gameState,
        players: newPlayers,
        properties: nextProperties,
        currentProperty: nextProperties[0],
        currentBids: {},
        biddingComplete: {},
        consecutivePasses: 0,
        currentPlayerIndex: 0,
        unownedProperties: newUnownedProperties,
        auctionHistory: [...gameState.auctionHistory, auctionResult]
      };
      setGameState(nextState);
      peerManager?.broadcast({ type: 'GAME_STATE', state: nextState });
    }
  };

  const submitGameToServer = async () => {
    if (!isHost) return;
    
    setIsSimulating(true);
    try {
      const results = await runSimulation(gameState.players);
      const finalState: GameState = {
        ...gameState,
        stage: 'results',
        simulationResults: results,
        currentProperty: null
      };
      setGameState(finalState);
      peerManager?.broadcast({ type: 'GAME_STATE', state: finalState });
    } catch (error) {
      console.error('Simulation error:', error);
      setAlertMessage("Failed to simulate game results");
      setShowAlert(true);
    } finally {
      setIsSimulating(false);
    }
  };

  return { handleBid, handlePass, finishAuction, submitGameToServer };
}