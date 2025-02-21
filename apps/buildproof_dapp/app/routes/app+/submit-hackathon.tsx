import React, { useState, useEffect, useMemo } from 'react';
import { Button, ButtonVariant, ButtonSize, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@0xintuition/buildproof_ui';
import PrizeDistribution from '../../components/prize-distribution.tsx';
import { Prize } from '../../components/prize-distribution.tsx';
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from '@remix-run/react'
import { AdminRoute } from '../../components/auth/admin-route.tsx'
import { useDomainFunds } from '../../lib/hooks/useDomainFunds';
import { useAdminAddresses } from '../../lib/hooks/useAdminAddresses';

// Définir toutes les interfaces nécessaires
interface Fund {
  ticker: string;
  amount: string;
}

interface Domain {
  domainId: number;
  domainName: string;
  funds: Fund[];
}

interface UserDomain {
  domainId: number;
  domainName: string;
  roles: string;
  reputation: string;
}

interface UserData {
  address: string;
  domains: UserDomain[];
}

const SubmitHackathon = () => {
  const { authenticated, ready, user } = usePrivy();
  const navigate = useNavigate();
  const { adminAddresses, isLoading: isLoadingAdmins } = useAdminAddresses();
  const { domainFunds, isLoading: isLoadingFunds } = useDomainFunds();
  
  // États
  const [userAdminDomains, setUserAdminDomains] = useState<Domain[]>([]);
  const [partnerName, setPartnerName] = useState('');
  const [hackathonTitle, setHackathonTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCashPrize, setTotalCashPrize] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [prizes, setPrizes] = useState<Prize[]>([{ name: 'First Place', amount: totalCashPrize, percent: 100 }]);
  const [totalPrizeAmount, setTotalPrizeAmount] = useState(0);

  // Vérification d'authentification
  useEffect(() => {
    if (ready && !authenticated) {
      navigate('/login?redirectTo=/app/submit-hackathon');
    }
  }, [ready, authenticated, navigate]);

  // Récupération des domaines de l'utilisateur
  useEffect(() => {
    const fetchUserDomains = async () => {
      if (!user?.wallet?.address || !domainFunds || domainFunds.length === 0) return;
      
      try {
        const userAddress = user.wallet.address.toLowerCase();
        const response = await fetch('http://localhost:3000/api/users');
        const userData: UserData[] = await response.json();
        const userInfo = userData.find(u => u.address.toLowerCase() === userAddress);
        
        if (!userInfo) return;
        
        const adminDomainIds = userInfo.domains
          .filter(d => d.roles.includes('Administration'))
          .map(d => d.domainId);
        
        const filteredDomains = domainFunds.filter(d => adminDomainIds.includes(d.domainId));
        setUserAdminDomains(filteredDomains);
      } catch (error) {
        console.error('Error fetching user domains:', error);
      }
    };

    fetchUserDomains();
  }, [user, domainFunds]);

  // Mise à jour du montant total des prix
  useEffect(() => {
    const total = prizes.reduce((total, prize) => total + (prize.amount || 0), 0);
    setTotalPrizeAmount(total);
  }, [prizes]);

  // Mise à jour des prix quand le ticker change
  useEffect(() => {
    if (selectedTicker) {
      setPrizes(currentPrizes => 
        currentPrizes.map(prize => ({
          ...prize,
          amount: prize.amount || 0
        }))
      );
    }
  }, [selectedTicker]);

  // Calcul du montant maximum
  const maxAmount = useMemo(() => {
    if (!selectedDomain || !selectedTicker) return 0;
    const domain = userAdminDomains.find(d => d.domainId === selectedDomain);
    const fund = domain?.funds.find((f: Fund) => f.ticker === selectedTicker);
    return fund ? parseFloat(fund.amount) : 0;
  }, [selectedDomain, selectedTicker, userAdminDomains]);

  // Loading state
  const isLoading = !ready || !authenticated || isLoadingAdmins || isLoadingFunds;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
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
    <AdminRoute>
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
        <Select
          value={selectedDomain?.toString()}
          onValueChange={(value) => {
            setSelectedDomain(parseInt(value));
            setSelectedTicker(''); // Réinitialiser le ticker lors du changement de domaine
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Domain" />
          </SelectTrigger>
          <SelectContent>
            {userAdminDomains.map((domain) => (
              <SelectItem key={domain.domainId} value={domain.domainId.toString()}>
                {domain.domainName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedDomain && (
          <Select
            value={selectedTicker}
            onValueChange={setSelectedTicker}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              {userAdminDomains
                .find(d => d.domainId === selectedDomain)
                ?.funds
                .filter((f: Fund) => parseFloat(f.amount) > 0)
                .map((fund: Fund) => (
                  <SelectItem key={fund.ticker} value={fund.ticker}>
                    {fund.ticker}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        <Input
          startAdornment="Total Cash Prize"
          type="number"
          value={totalCashPrize}
          onChange={(e) => setTotalCashPrize(Math.min(parseFloat(e.target.value), maxAmount))}
          placeholder="Enter total cash prize amount"
          required
          endAdornment={selectedTicker}
          max={maxAmount}
          disabled={!selectedDomain || !selectedTicker}
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
            prizes={prizes}
            prizesNumber={prizes.length}
            selectedTicker={selectedTicker}
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
    </AdminRoute>
  );
};

export default SubmitHackathon;