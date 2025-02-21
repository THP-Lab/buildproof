import React, { useEffect } from 'react';
import { Button, ButtonVariant, ButtonSize, Input } from '@0xintuition/buildproof_ui';

export interface Prize {
  name: string;
  amount: number;
  percent?: number;
  otherName?: string;
}

interface PrizeDistributionProps {
  prize: Prize;
  index: number;
  removePrize: (index: number) => void;
  updatePrize: (index: number, updatedPrize: Prize) => void;
  availableOptions: { value: string; label: string }[];
  totalCashPrize: number;
  prizesNumber: number;
  prizes: Prize[];
  selectedTicker: string;
}

const PrizeDistribution: React.FC<PrizeDistributionProps> = ({ prize, index, removePrize, updatePrize, availableOptions, totalCashPrize, prizesNumber, prizes, selectedTicker }) => {

  const handleAmountChange = (amount: number) => {
    if (totalCashPrize > 0) {
      const percent = (amount / totalCashPrize) * 100;
      updatePrize(index, { ...prize, amount, percent });
    } else {
      updatePrize(index, { ...prize, amount });
    }
  };

  const handlePercentChange = (percent: number) => {
    const amount = (percent / 100) * totalCashPrize;
    updatePrize(index, { ...prize, amount, percent });
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between">
        <span className="text-lg font-bold">{prize.name}</span>
        <Button 
          variant={ButtonVariant.destructiveOutline}
          size={ButtonSize.default}
          type="button" 
          onClick={() => removePrize(index)} 
          className="px-4 py-0.4"
          disabled={prize.name === 'First Place'}
        >
          Remove Prize
        </Button>
      </div>
      {prize.name === 'Other' && (
        <Input
          startAdornment="Other Prize Name"
          value={prize.otherName || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePrize(index, { ...prize, otherName: e.target.value })}
        />
      )}
      <div className="flex space-x-2">
        <Input
          startAdornment="Amount"
          type="number"
          value={prize.amount.toString()}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAmountChange(parseInt(e.target.value))}
          endAdornment={selectedTicker || '$'}
        />
        <Input
          startAdornment="Percent"
          type="number"
          value={prize.percent || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePercentChange(parseInt(e.target.value))}
          endAdornment="%"
        />
      </div>
    </div>
  );
};

export default PrizeDistribution;
