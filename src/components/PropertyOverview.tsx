import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import PropertyCard from './PropertyCard';
import { PropertyGroup } from '@/lib/constants';

interface Property {
  name: string;
  group: PropertyGroup;
  price: number;
}

interface PropertyOverviewProps {
  players: {
    [key: string]: {
      money: number;
      properties: Property[];
    };
  };
  currentPlayer?: string;
}

const PropertyOverview = ({ players, currentPlayer }: PropertyOverviewProps) => {
  // Group properties by color group for each player
  const getGroupedProperties = (playerProps: Property[]) => {
    return playerProps.reduce((acc, prop) => {
      if (!acc[prop.group]) {
        acc[prop.group] = [];
      }
      // @ts-expect-error
      acc[prop.group].push(prop);
      return acc;
    }, {} as { [key in PropertyGroup]?: Property[] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(players).map(([playerName, playerData]) => {
            const groupedProperties = getGroupedProperties(playerData.properties);
            const isCurrentPlayer = playerName === currentPlayer;

            return (
              <div 
                key={playerName} 
                className={`p-3 rounded-lg border ${isCurrentPlayer ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <h3 className="font-bold mb-2">{playerName} (${playerData.money})</h3>
                <div className="space-y-2">
                  {Object.entries(groupedProperties).map(([group, props]) => (
                    <div key={group} className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-medium w-24">{group}:</span>
                      <div className="flex gap-1 flex-wrap">
                        {props && props.map(prop => (
                          <PropertyCard 
                            key={prop.name}
                            name={prop.name}
                            group={prop.group}
                            size="small"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyOverview;