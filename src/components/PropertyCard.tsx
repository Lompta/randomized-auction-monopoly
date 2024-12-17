import React from 'react';
import { GROUP_COLORS, type PropertyGroup } from '@/lib/constants';

interface PropertyCardProps {
  name: string;
  group: PropertyGroup;
  size?: 'small' | 'normal';
}

const PropertyCard = ({ name, group, size = 'normal' }: PropertyCardProps) => {
  const baseClasses = `${GROUP_COLORS[group]} rounded shadow-sm flex items-center justify-center text-white`;
  const sizeClasses = size === 'small' ? 'p-1 text-xs h-8' : 'p-2 text-sm h-12';
  
  return (
    <div className={`${baseClasses} ${sizeClasses}`}>
      {name}
    </div>
  );
};

export default PropertyCard;