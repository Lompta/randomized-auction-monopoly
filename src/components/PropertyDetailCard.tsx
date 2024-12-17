// @ts-nocheck
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GROUP_COLORS } from '@/lib/constants';

interface PropertyDetailCardProps {
  property: {
    name: string;
    group: string;
    price: number;
    baseRent: number;
    houseRent?: number[];
    hotelRent?: number;
    houseCost?: number;
  };
  className?: string;
}

const PropertyDetailCard = ({ property, className = '' }: PropertyDetailCardProps) => {
  const isPropertyDevelopable = property.group !== 'railroad' && property.group !== 'utility';

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4 space-y-3">
        <div className={`${GROUP_COLORS[property.group]} text-white p-3 rounded-md`}>
          <h3 className="text-xl font-bold">{property.name}</h3>
          <p className="text-sm opacity-90">{property.group.charAt(0).toUpperCase() + property.group.slice(1)}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Price:</span>
            <span>${property.price}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Base Rent:</span>
            <span>${property.baseRent}</span>
          </div>

          {isPropertyDevelopable && property.houseRent && (
            <div className="space-y-1">
              <div className="font-medium">House Rent:</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {property.houseRent.map((rent, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{i + 1} House{i !== 0 ? 's' : ''}:</span>
                    <span>${rent}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isPropertyDevelopable && property.hotelRent && (
            <div className="flex justify-between">
              <span className="font-medium">Hotel Rent:</span>
              <span>${property.hotelRent}</span>
            </div>
          )}

          {isPropertyDevelopable && property.houseCost && (
            <div className="flex justify-between">
              <span className="font-medium">House Cost:</span>
              <span>${property.houseCost}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDetailCard;