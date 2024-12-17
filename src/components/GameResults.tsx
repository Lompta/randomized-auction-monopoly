// @ts-nocheck
import React from 'react';
import { Trophy, Medal, Star, Clock, RotateCw } from 'lucide-react';

const GameResults = ({ 
  results, 
  isHost, 
  onPlayAgain 
}) => {
  // Sort players by win percentage
  const sortedPlayers = Object.entries(results.survival_rates)
    .sort(([, rateA], [, rateB]) => {
      const percentA = parseFloat(rateA);
      const percentB = parseFloat(rateB);
      return percentB - percentA;
    });

  const getTrophy = (index) => {
    switch(index) {
      case 0: return <Trophy className="text-yellow-400 w-8 h-8" />;
      case 1: return <Medal className="text-gray-400 w-8 h-8" />;
      case 2: return <Medal className="text-amber-600 w-8 h-8" />;
      default: return <Star className="text-gray-300 w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-blue-50 to-white p-6 rounded-lg shadow-lg">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-blue-900">Game Results!</h2>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Clock className="w-5 h-5" />
          <span>Average game length: {results.average_rounds} rounds</span>
        </div>
      </div>

      <div className="space-y-4">
        {sortedPlayers.map(([playerName, survivalRate], index) => (
          <div 
            key={playerName}
            className={`p-4 rounded-lg transition-all duration-300 ${
              index === 0 ? 'bg-yellow-50 shadow-md transform hover:scale-102' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              {getTrophy(index)}
              <div className="flex-grow">
                <h3 className="text-lg font-bold">{playerName}</h3>
                <div className="text-sm text-gray-600">
                  Survival Rate: {survivalRate}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {results.bankruptcies[playerName]} bankruptcies
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        Based on {results.games_played} simulated games • 
        {results.draws} draws ({results.draw_percentage})
      </div>

      {isHost && (
        <div className="text-center pt-4">
          <button
            onClick={onPlayAgain}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full shadow-md transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GameResults;