'use client';

import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePeer } from '@/lib/peerContext';
import { INITIAL_GAME_STATE, INITIAL_MONEY, GameState, GameSettings } from '@/lib/gameConstants';
import { PROPERTIES } from '@/lib/monopoly/board';
import { useAuctionState } from '@/lib/hooks/useAuctionState';
import { useGameActions } from '@/lib/hooks/useGameActions';
import { calculateHighestBid, getPlayerMoney, isPlayerTurn } from '@/lib/gameUtils';
import CompactPropertyDisplay from '@/components/CompactPropertyDisplay';
import PropertyDetailCard from '@/components/PropertyDetailCard';
import GameResults from '@/components/GameResults';
import AuctionHistory from '@/components/AuctionHistory';

interface Props {
  isHost: boolean;
  initialSettings: GameSettings;
}

const MonopolyAuction = ({ isHost, initialSettings }: Props) => {
  const { peerManager, connectedPlayers } = usePeer();
  const [currentBidAmount, setCurrentBidAmount] = useState<string>('');
  
  const {
    gameState,
    setGameState,
    showAlert,
    setShowAlert,
    alertMessage,
    setAlertMessage,
    isSimulating,
    setIsSimulating
  } = useAuctionState(isHost, initialSettings);

  const {
    handleBid,
    handlePass,
    finishAuction,
    submitGameToServer
  } = useGameActions(
    isHost,
    gameState,
    setGameState,
    peerManager,
    connectedPlayers,
    setIsSimulating,
    setAlertMessage,
    setShowAlert
  );

  const currentPlayerName = connectedPlayers[gameState.currentPlayerIndex];
  const isCurrentUserTurn = isPlayerTurn(gameState.currentPlayerIndex, connectedPlayers, peerManager?.myName);
  const highestBid = calculateHighestBid(gameState);
  const currentPlayerMoney = getPlayerMoney(gameState, currentPlayerName);
  const hasUserBid = gameState.biddingComplete[peerManager?.myName || ''];

  useEffect(() => {
    if (!peerManager) return;

    return peerManager.onMessage((msg: any) => {
      try {
        if (msg.type === 'GAME_STATE') {
          setGameState(msg.state);
        } else if (msg.type === 'BID' && isHost) {
          handleBid(msg.amount, msg.player);
        } else if (msg.type === 'PASS' && isHost) {
          handlePass(msg.player);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        setAlertMessage('An error occurred processing the game state');
        setShowAlert(true);
      }
    });
  }, [peerManager, isHost, handleBid, handlePass, setGameState, setAlertMessage, setShowAlert]);

  const onBid = () => {
    if (!peerManager || !peerManager.myName) return;

    const amount = parseInt(currentBidAmount, 10);
    const minBid = gameState.settings.simultaneousMode ? 0 : highestBid + 1;
    const userMoney = getPlayerMoney(gameState, peerManager.myName);

    if (isNaN(amount) || amount < minBid || amount > userMoney) {
      setAlertMessage(gameState.settings.simultaneousMode
        ? "Invalid bid amount"
        : `Bid must be between $${minBid} and $${userMoney}`);
      setShowAlert(true);
      return;
    }

    peerManager.broadcast({ type: 'BID', amount, player: peerManager.myName });
    setCurrentBidAmount('');
  };

  const onPass = () => {
    if (!peerManager?.myName) return;
    peerManager.broadcast({ type: 'PASS', player: peerManager.myName });
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Players' Holdings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Players' Holdings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(gameState.players).map(([player, data]) => (
                <div 
                  key={player} 
                  className={`p-2 rounded ${
                    player === currentPlayerName ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold">{player}</h4>
                    <span>Money: ${data.money}</span>
                  </div>
                  <CompactPropertyDisplay 
                    properties={data.properties}
                    isHighlighted={player === currentPlayerName}
                    showTooltips={true}
                  />
                </div>
              ))}

              {gameState.unownedProperties && gameState.unownedProperties.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Unclaimed Properties</h3>
                  <CompactPropertyDisplay 
                    properties={gameState.unownedProperties}
                    showTooltips={true}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {gameState.auctionHistory.length > 0 && (
          <div>
            <AuctionHistory history={gameState.auctionHistory} />
          </div>
        )}
      </div>

      {/* Game Stage Content */}
      {gameState.stage === 'results' && gameState.simulationResults ? (
        <GameResults 
          results={gameState.simulationResults}
          isHost={isHost}
          onPlayAgain={() => {
            if (isHost && peerManager) {
              const initialPlayers = Object.fromEntries(
                connectedPlayers.map(name => [name, { money: INITIAL_MONEY, properties: [] }])
              );
              
              const shuffledProperties = [...PROPERTIES].sort(() => Math.random() - 0.5);
              
              const newState: GameState = {
                ...INITIAL_GAME_STATE,
                settings: gameState.settings, // Preserve settings for next game
                players: initialPlayers,
                currentProperty: shuffledProperties[0],
                properties: shuffledProperties,
              };
  
              setGameState(newState);
              peerManager.broadcast({ type: 'GAME_STATE', state: newState });
            }
          }}
        />
      ) : gameState.stage === 'auction' && gameState.currentProperty ? (
        <div className="grid gap-4 md:grid-cols-2">
          <PropertyDetailCard property={gameState.currentProperty} />
          <Card>
            <CardHeader>
              <CardTitle>
                {gameState.settings.simultaneousMode ? 'Simultaneous Bidding Round' : 'Current Auction'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {gameState.settings.simultaneousMode ? (
                  // Simultaneous mode bidding UI
                  !hasUserBid && peerManager?.myName && (
                    <>
                      <input 
                        type="number" 
                        className="border p-2 rounded"
                        placeholder="Enter bid amount"
                        value={currentBidAmount}
                        min={0}
                        max={getPlayerMoney(gameState, peerManager.myName)}
                        onChange={(e) => setCurrentBidAmount(e.target.value)}
                      />
                      <button
                        onClick={onBid}
                        disabled={!currentBidAmount}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                      >
                        Submit Bid
                      </button>
                      <button
                        onClick={onPass}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                      >
                        Pass
                      </button>
                    </>
                  )
                ) : (
                  // Turn-based bidding UI
                  isCurrentUserTurn && (
                    <>
                      <input 
                        type="number" 
                        className="border p-2 rounded"
                        placeholder="Enter bid amount"
                        value={currentBidAmount}
                        min={highestBid + 1}
                        max={currentPlayerMoney}
                        onChange={(e) => setCurrentBidAmount(e.target.value)}
                      />
                      <button
                        onClick={onBid}
                        disabled={!currentBidAmount}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                      >
                        Bid
                      </button>
                      <button
                        onClick={onPass}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                      >
                        Pass
                      </button>
                    </>
                  )
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(gameState.players).map(([player, _]) => (
                  <div 
                    key={player} 
                    className={`p-2 border rounded ${
                      gameState.settings.simultaneousMode
                        ? gameState.biddingComplete[player] ? 'bg-green-50' : 'bg-yellow-50'
                        : player === currentPlayerName ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>{player}</span>
                      <span>
                        {gameState.settings.simultaneousMode 
                          ? gameState.biddingComplete[player]
                            ? 'Bid Submitted'
                            : 'Thinking...'
                          : `Bid: $${gameState.currentBids[player] || 0}`
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : isSimulating ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-4">Simulating Games...</h3>
            <p>Please wait while we simulate multiple games to determine the winner.</p>
          </CardContent>
        </Card>
      ) : null}

      {showAlert && ( //@ts-expect-error
        <AlertDialog>
          <AlertDialogAction onClick={() => setShowAlert(false)}>
            {alertMessage}
          </AlertDialogAction>
        </AlertDialog>
      )}
    </div>
  );
};

export default MonopolyAuction;