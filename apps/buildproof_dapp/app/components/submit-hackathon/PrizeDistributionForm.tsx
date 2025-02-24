import React from 'react';
import { Button, ButtonVariant, ButtonSize, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@0xintuition/buildproof_ui';
import type { Prize } from 'app/utils/submit-hackathon/types';
import { PRIZE_OPTIONS } from 'app/utils/submit-hackathon/constants';
import { getAvailablePrizeOptions } from 'app/utils/submit-hackathon/validation';

interface PrizeDistributionFormProps {
  prizes: Prize[];
  totalCashPrize: number;
  selectedTicker: string;
  onAddPrize: () => void;
  onRemovePrize: (index: number) => void;
  onUpdatePrize: (index: number, prize: Prize) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isValid: boolean;
}

export const PrizeDistributionForm: React.FC<PrizeDistributionFormProps> = ({
  prizes,
  totalCashPrize,
  selectedTicker,
  onAddPrize,
  onRemovePrize,
  onUpdatePrize,
  onSubmit,
  isValid
}) => {
  const totalPrizeAmount = prizes.reduce((total, prize) => total + (prize.amount || 0), 0);
  const availablePrizeOptions = getAvailablePrizeOptions(prizes, PRIZE_OPTIONS);

  return (
    <div className="space-y-4">
      {prizes.map((prize, index) => (
        <div key={index} className="flex flex-col gap-2 p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Prize #{index + 1}</h3>
            {index > 0 && (
              <Button
                variant={ButtonVariant.destructiveOutline}
                size={ButtonSize.default}
                onClick={() => onRemovePrize(index)}
              >
                Remove
              </Button>
            )}
          </div>

          {index === 0 ? (
            <div className="text-lg font-medium text-gray-700">First Place</div>
          ) : prize.name === 'Other' ? (
            <Input
              startAdornment="Prize Name"
              value={prize.otherName || ''}
              onChange={(e) => onUpdatePrize(index, { ...prize, otherName: e.target.value })}
              placeholder="Enter prize name"
              required
            />
          ) : (
            <Select
              value={prize.name}
              onValueChange={(value) => onUpdatePrize(index, { ...prize, name: value })}
            >
              <SelectTrigger>
                <SelectValue>
                  {PRIZE_OPTIONS.find(option => option.value === prize.name)?.label || prize.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availablePrizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Input
            type="number"
            startAdornment="Amount"
            endAdornment={selectedTicker}
            value={prize.amount.toString()}
            onChange={(e) => onUpdatePrize(index, { ...prize, amount: parseFloat(e.target.value) })}
            max={totalCashPrize}
            required
          />

          <div className="flex gap-4 items-center">
            <Input
              type="number"
              startAdornment="Percentage"
              endAdornment="%"
              value={((prize.amount / totalCashPrize) * 100).toFixed(2)}
              onChange={(e) => {
                const newPercent = parseFloat(e.target.value);
                const newAmount = (newPercent / 100) * totalCashPrize;
                onUpdatePrize(index, { ...prize, amount: newAmount });
              }}
              min={0}
              max={100}
              step={0.01}
              required
            />
          </div>

          <div className="text-sm text-gray-500">
            {((prize.amount / totalCashPrize) * 100).toFixed(2)}% of total prize pool
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center">
        <Button
          variant={ButtonVariant.successOutline}
          size={ButtonSize.md}
          onClick={onAddPrize}
          disabled={prizes.length >= 5}
          type="button"
        >
          Add Prize
        </Button>

        <Button
          variant={ButtonVariant.accentOutline}
          size={ButtonSize.md}
          type="submit"
          disabled={!isValid || totalPrizeAmount !== totalCashPrize}
        >
          Submit
        </Button>
      </div>

      {totalPrizeAmount !== totalCashPrize && (
        <div className="text-red-500">
          {totalPrizeAmount > totalCashPrize 
            ? "Total prize amounts exceed the total cash prize!"
            : "Total prize amounts are less than the total cash prize!"}
        </div>
      )}
    </div>
  );
}; 