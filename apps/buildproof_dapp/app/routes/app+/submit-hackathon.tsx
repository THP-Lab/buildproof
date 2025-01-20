import React, { useState, useEffect } from 'react';
import { Button, ButtonVariant, ButtonSize, Input, Textarea } from '@0xintuition/buildproof_ui';
import PrizeDistribution from '../../components/prize-distribution.tsx';
import { Prize } from '../../components/prize-distribution.tsx';
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from '@remix-run/react'

const SubmitHackathon = () => {
  const { authenticated, ready } = usePrivy()
  const navigate = useNavigate()
  const [partnerName, setPartnerName] = useState('');
  const [hackathonTitle, setHackathonTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCashPrize, setTotalCashPrize] = useState(0);
  const [prizes, setPrizes] = useState<Prize[]>([{ name: 'First Place', amount: totalCashPrize, percent: 100 }]);

  useEffect(() => {
    if (ready && !authenticated) {
      navigate('/login?redirectTo=/app/submit-hackathon')
    }
  }, [ready, authenticated, navigate])

  if (!ready || !authenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de soumission ici
  };

  const addPrize = () => {
    const prizeOrder = ['Second Place', 'Third Place', 'Other'];
    const nextPrize = prizeOrder[prizes.length - 1] || 'Other';
    setPrizes([...prizes, { name: nextPrize, amount: 0 }]);
  };

  const removePrize = (index: number) => {
    const newPrizes = prizes.filter((_, i) => i !== index);
    setPrizes(newPrizes);
  };

  let totalPrizeAmount = prizes.reduce((total, prize) => total + (prize.amount || 0), 0);

  useEffect(() => {
    totalPrizeAmount = prizes.reduce((total, prize) => total + (prize.amount || 0), 0)
  }, [prizes]);

  const today = new Date();
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const prizeOptions = [
    { value: 'First Place', label: 'First Place' },
    { value: 'Second Place', label: 'Second Place' },
    { value: 'Third Place', label: 'Third Place' },
    { value: 'Other', label: 'Other' },
  ];

  // Fonction pour obtenir les options de prix disponibles
  const getAvailablePrizeOptions = () => {
    const usedPrizes = prizes.map(prize => prize.name);
    return prizeOptions.filter(option => option.value === 'other' || !usedPrizes.includes(option.value));
  };

  const updatePrize = (index: number, updatedPrize: Prize) => {
    const newPrizes = [...prizes];
    newPrizes[index] = updatedPrize;
    setPrizes(newPrizes);
  };

  const handleTotalCashPrizeChange = (value: number) => {
    setTotalCashPrize(value);
    // Recalcule les pourcentages pour tous les prix
    const updatedPrizes = prizes.map(prize => ({
      ...prize,
      percent: value > 0 ? (prize.amount / value) * 100 : 0
    }));
    setPrizes(updatedPrizes);
  };

  // Ajoute cette fonction pour vérifier si le formulaire est valide
  const isFormValid = () => {
    const isAllFieldsFilled =
      partnerName !== '' &&
      hackathonTitle !== '' &&
      description !== '' &&
      startDate !== '' &&
      endDate !== '' &&
      totalCashPrize > 0;

    const isTotalCorrect = totalPrizeAmount === totalCashPrize;

    return isAllFieldsFilled && isTotalCorrect;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Submit a New Hackathon</h1>
      <Input
        startAdornment="Partner Name"
        value={partnerName}
        onChange={(e) => setPartnerName(e.target.value)}
        required
      />
      <Input
        startAdornment="Hackathon Title"
        value={hackathonTitle}
        onChange={(e) => setHackathonTitle(e.target.value)}
        required
      />
      <div className="flex flex-col">
        <label className="mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a brief description of the hackathon"
          required
        />
      </div>
      <Input
        type="date"
        startAdornment="Start Date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
        min={tomorrow.toISOString().split("T")[0]}
      />
      <Input
        type="date"
        startAdornment="End Date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
        min={startDate ? new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : ''}
        disabled={!startDate || new Date(startDate) < today}
      />
      <Input
        startAdornment="Total Cash Prize"
        type="number"
        value={totalCashPrize}
        onChange={(e) => setTotalCashPrize(parseInt(e.target.value))}
        placeholder="Enter total cash prize amount"
        required
        endAdornment="$"
      />
      {prizes.map((prize, index) => (
        <PrizeDistribution
          key={index}
          prize={prize}
          index={index}
          removePrize={removePrize}
          updatePrize={updatePrize}
          availableOptions={getAvailablePrizeOptions()}
          totalCashPrize={totalCashPrize || 0}
        />
      ))}
      <div className="text-red-500">
        {totalPrizeAmount > totalCashPrize && (
          <p>Total prize amounts exceed the total cash prize!</p>
        )}
      </div>
      <div className="flex justify-between">
        <Button
          variant={ButtonVariant.successOutline}
          size={ButtonSize.md}
          type="button"
          onClick={addPrize}
          className="px-4 py-2"
        >
          Add Prize
        </Button>
        <Button
          variant={ButtonVariant.accentOutline}
          size={ButtonSize.md}
          type="submit"
          disabled={!isFormValid()}
          className="px-4 py-2"
        >
          Submit
        </Button>
      </div>
    </form>
  );
};

export default SubmitHackathon;