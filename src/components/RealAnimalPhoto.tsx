import React, { useState } from 'react';
import { WildAnimal } from '../data/animals';
import { AnimalArtwork } from './AnimalArtwork';

interface RealAnimalPhotoProps {
  animal: WildAnimal;
  className?: string;
}

export const RealAnimalPhoto: React.FC<RealAnimalPhotoProps> = ({
  animal,
  className = 'w-full h-full',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EDF3E7] to-[#DCE8D3] p-4 ${className}`}
      >
        <div className="w-24 h-24">
          <AnimalArtwork animalId={animal.id} />
        </div>
        <span className="font-display text-sm font-bold text-[#14532D] mt-1">
          {animal.name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={animal.realPhotoUrl}
      alt={`Foto nyata ${animal.name} di alam bebas`}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover select-none ${className}`}
      draggable={false}
    />
  );
};
