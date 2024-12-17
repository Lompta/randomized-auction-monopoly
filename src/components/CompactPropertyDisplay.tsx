// @ts-nocheck
import React from 'react';
import { GROUP_COLORS } from '@/lib/constants';

const sortProperties = (properties) => {
  const groupOrder = [
    'brown', 'lightBlue', 'pink', 'orange', 'red', 
    'yellow', 'green', 'darkBlue', 'railroad', 'utility'
  ];

  return [...properties].sort((a, b) => {
    const groupDiff = groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group);
    if (groupDiff !== 0) return groupDiff;
    return a.price - b.price;
  });
};

const CompactPropertyDisplay = ({ 
  properties,
  isHighlighted = false,
  showTooltips = false 
}) => {
  if (!properties || properties.length === 0) return null;

  const sortedProperties = sortProperties(properties);
  const propertyGroups = sortedProperties.reduce((groups, property) => {
    if (!groups[property.group]) {
      groups[property.group] = [];
    }
    groups[property.group].push(property);
    return groups;
  }, {});

  return (
    <div className={`p-2 rounded ${isHighlighted ? 'bg-blue-50 border border-blue-200' : ''}`}>
      <div className="flex flex-wrap gap-1">
        {Object.entries(propertyGroups).map(([group, props]) => (
          <div key={group} className="flex flex-wrap gap-1">
            {props.map((property) => (
              <div
                key={property.name}
                className={`${GROUP_COLORS[property.group]} text-xs p-1 rounded shadow-sm relative group cursor-pointer`}
                style={{ minWidth: '60px', maxWidth: '100px' }}
              >
                <div className="text-white text-center whitespace-nowrap overflow-hidden text-ellipsis">
                  {property.name}
                </div>
                
                {showTooltips && (
                  <div className="absolute z-10 invisible group-hover:visible bg-white text-black p-2 rounded shadow-lg -top-2 left-full ml-2 text-xs whitespace-nowrap">
                    <div className="font-bold">{property.name}</div>
                    <div>Price: ${property.price}</div>
                    <div>Rent: ${property.baseRent}</div>
                    {property.group !== 'railroad' && property.group !== 'utility' && (
                      <>
                        <div>House Cost: ${property.houseCost}</div>
                        <div className="text-xs mt-1">
                          Houses: {property.houseRent.map((rent, i) => (
                            <span key={i}>${rent}{i < property.houseRent.length - 1 ? ', ' : ''}</span>
                          ))}
                        </div>
                        <div>Hotel: ${property.hotelRent}</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompactPropertyDisplay;