import React, { useEffect } from 'react';
import { Button, ButtonVariant, ButtonSize, Input } from '../../../../packages/buildproof_ui/src/components';

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
}

const PrizeDistribution: React.FC<PrizeDistributionProps> = ({ prize, index, removePrize, updatePrize, availableOptions, totalCashPrize, prizesNumber }) => {

  useEffect(() => {
    let amount = prize.amount;
    if (prizesNumber < 2) {
      amount = totalCashPrize;
    }
    
      const percent = (amount / totalCashPrize) * 100;
      updatePrize(index, { ...prize, amount, percent });
    
  }, [totalCashPrize]);

  const handleAmountChange = (amount: number) => {
    const percent = (amount / totalCashPrize) * 100;
    updatePrize(index, { ...prize, amount, percent });
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
          onChange={(e) => updatePrize(index, { ...prize, otherName: e.target.value })}
        />
      )}
      <div className="flex space-x-2">
        <Input
          startAdornment="Amount"
          type="number"
          value={prize.amount}
          onChange={(e) => handleAmountChange(parseInt(e.target.value))}
           endAdornment="$"
        />
        <Input
          startAdornment="Percent"
          type="number"
          value={prize.percent || ''}
          onChange={(e) => handlePercentChange(parseInt(e.target.value))}
           endAdornment="%"
        />
      </div>
    </div>
  );
};

export default PrizeDistribution;
