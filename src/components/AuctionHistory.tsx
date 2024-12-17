import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuctionResult } from '@/lib/gameConstants';

interface AuctionHistoryProps {
  history: AuctionResult[];
}

const AuctionHistory = ({ history }: AuctionHistoryProps) => {
  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previous Auctions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-64 overflow-y-auto">
        {history.map((result, index) => (
          <div 
            key={index}
            className="p-3 border rounded bg-gray-50"
          >
            <div className="font-medium">{result.property.name}</div>
            <div className="text-sm text-gray-600">
              Won by {result.winner} for ${result.amount}
            </div>
            <div className="mt-2 text-sm">
              <div className="font-medium">All bids:</div>
              {Object.entries(result.allBids)
                .sort(([, a], [, b]) => b - a) // Sort by bid amount
                .map(([player, bid]) => (
                  <div key={player} className="flex justify-between">
                    <span>{player}</span>
                    <span>${bid}</span>
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AuctionHistory;