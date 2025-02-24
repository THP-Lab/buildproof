import { useState, useEffect } from 'react';
import type { Prize } from 'app/utils/submit-hackathon/types';
import { PRIZE_ORDER } from 'app/utils/submit-hackathon/constants';

export const usePrizeDistribution = (totalCashPrize: number = 0) => {
  const [prizes, setPrizes] = useState<Prize[]>([
    { name: 'First Place', amount: totalCashPrize, percent: 100 }
  ]);
  const [totalPrizeAmount, setTotalPrizeAmount] = useState(totalCashPrize);

  // Update first place amount when total cash prize changes
  useEffect(() => {
    if (prizes.length === 1) {
      setPrizes([{ name: 'First Place', amount: totalCashPrize, percent: 100 }]);
    } else {
      const remainingAmount = totalCashPrize - prizes.slice(1).reduce((sum, p) => sum + p.amount, 0);
      const updatedPrizes = prizes.map((prize, index) => ({
        ...prize,
        amount: index === 0 ? remainingAmount : prize.amount,
        percent: (prize.amount / totalCashPrize) * 100
      }));
      setPrizes(updatedPrizes);
    }
  }, [totalCashPrize]);

  // Update total prize amount when prizes change
  useEffect(() => {
    const total = prizes.reduce((total, prize) => total + (prize.amount || 0), 0);
    setTotalPrizeAmount(total);
  }, [prizes]);

  const addPrize = () => {
    if (prizes.length >= 5) return;
    
    const nextPrizeName = PRIZE_ORDER[prizes.length - 1] || 'Other';
    const remainingAmount = Math.max(0, totalCashPrize - totalPrizeAmount);
    const newPrizeAmount = remainingAmount > 0 ? remainingAmount : 0;
    
    setPrizes([...prizes, { 
      name: nextPrizeName, 
      amount: newPrizeAmount,
      percent: (newPrizeAmount / totalCashPrize) * 100 
    }]);
  };

  const removePrize = (index: number) => {
    if (index === 0) return; // Ne pas permettre la suppression du premier prix
    
    const newPrizes = prizes.filter((_, i) => i !== index);
    const remainingAmount = totalCashPrize - newPrizes.slice(1).reduce((sum, p) => sum + p.amount, 0);
    
    newPrizes[0] = {
      ...newPrizes[0],
      amount: remainingAmount,
      percent: (remainingAmount / totalCashPrize) * 100
    };
    
    setPrizes(newPrizes);
  };

  const updatePrize = (index: number, updatedPrize: Prize) => {
    const newPrizes = [...prizes];
    newPrizes[index] = updatedPrize;
    
    // Si ce n'est pas le premier prix, ajuster le montant du premier prix
    if (index !== 0) {
      const otherPrizesTotal = newPrizes
        .slice(1)
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const remainingAmount = Math.max(0, totalCashPrize - otherPrizesTotal);
      
      newPrizes[0] = {
        ...newPrizes[0],
        amount: remainingAmount,
        percent: (remainingAmount / totalCashPrize) * 100
      };
    }
    
    setPrizes(newPrizes);
  };

  return {
    prizes,
    totalPrizeAmount,
    addPrize,
    removePrize,
    updatePrize
  };
}; 