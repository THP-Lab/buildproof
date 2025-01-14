import React, { useState } from 'react';
import { Button, ButtonVariant, ButtonSize, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from '../../../../packages/buildproof_ui/src/components';

interface Prize {
  name: string;
  amount: string;
  otherName?: string;
}

interface PrizeDistributionProps {
  prize: Prize;
  index: number;
  removePrize: (index: number) => void;
  updatePrize: (index: number, updatedPrize: Prize) => void;
  availableOptions: { value: string; label: string }[];
}

const PrizeDistribution: React.FC<PrizeDistributionProps> = ({ prize, index, removePrize, updatePrize, availableOptions }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Fonction pour obtenir les options disponibles pour le dropdown
  const getDropdownOptions = () => {
    const baseOptions = [
      { value: 'First Place', label: 'First Place' },
      { value: 'Second Place', label: 'Second Place' },
      { value: 'Third Place', label: 'Third Place' },
      { value: 'Other', label: 'Other' }
    ];

    // Si on est en mode édition, on réinitialise toutes les options
    if (isEditing) {
      // Filtrer les options : garder celles disponibles et l'option actuellement sélectionnée
      return baseOptions.filter(option => 
        option.value === 'Other' || // Toujours montrer Other
        option.value === prize.name || // Garder l'option actuelle
        availableOptions.some(availOpt => availOpt.value === option.value) // Garder les options disponibles
      );
    }

    // Pour un nouveau select ou après avoir quitté l'édition
    return [
      ...availableOptions,
      // Toujours ajouter Other s'il n'est pas déjà présent
      ...(!availableOptions.some(opt => opt.value === 'Other') ? [{ value: 'Other', label: 'Other' }] : [])
    ];
  };

  const handleValueChange = (value: string) => {
    const updatedPrize = { ...prize, name: value, otherName: value !== 'Other' ? '' : prize.otherName };
    updatePrize(index, updatedPrize);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        {prize.name && !isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant={ButtonVariant.ghost}
            className="flex items-center w-full px-3 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
          >
            <span className="text-lg font-bold">{prize.name}</span>
            <span className="ml-2 text-sm text-gray-400">(click to edit)</span>
          </Button>
        ) : (
          <Select
            value={prize.name}
            onValueChange={handleValueChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Prize Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Prize Names</SelectLabel>
                {getDropdownOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        <Button 
          variant={ButtonVariant.destructiveOutline}
          size={ButtonSize.default}
          type="button" 
          onClick={() => removePrize(index)} 
          className="px-4 py-0.4"
        >
          Remove Prize
        </Button>
      </div>
      {prize.name === 'Other' && (
        <Input
          startAdornment="Other Prize Name"
          value={prize.otherName || ''}
          onChange={(e) => updatePrize(index, { ...prize, otherName: e.target.value })}
        />
      )}
      <Input
        startAdornment="Amount"
        type="number"
        value={prize.amount}
        onChange={(e) => updatePrize(index, { ...prize, amount: e.target.value })}
      />
    </div>
  );
};

export default PrizeDistribution;
