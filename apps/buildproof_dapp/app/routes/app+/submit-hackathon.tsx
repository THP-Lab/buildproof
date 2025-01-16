import React, { useState, useEffect } from 'react';
import { Button, ButtonVariant, ButtonSize, Input, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle } from '@0xintuition/buildproof_ui';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from '@remix-run/react';
import { useBatchCreateTriple } from '../../lib/hooks/useBatchCreateTriple';
import PrizeDistribution from '../../components/prize-distribution.tsx';
import type { Prize } from '../../components/prize-distribution.tsx';
import { multivaultAbi } from '@lib/abis/multivault';
import { MULTIVAULT_CONTRACT_ADDRESS } from 'app/consts';

const SubmitHackathon = () => {
  const { authenticated, ready, login } = usePrivy()
  const navigate = useNavigate()
  const [partnerName, setPartnerName] = useState('');
  const [hackathonTitle, setHackathonTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCashPrize, setTotalCashPrize] = useState(0);
  const [prizes, setPrizes] = useState<Prize[]>([
    { name: 'First Place', amount: 0, percent: 0 }
  ]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [triples, setTriples] = useState<any[]>([]);

  const { writeContractAsync: createTriples } = useBatchCreateTriple();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Création des triples ici
    const mainTriples = [
      {
        subjectId: BigInt(1),
        predicateId: BigInt(2),
        objectId: BigInt(totalCashPrize || 0),
      },
      {
        subjectId: BigInt(1),
        predicateId: BigInt(3),
        objectId: BigInt(new Date(startDate).getTime() || 0),
      },
      {
        subjectId: BigInt(1),
        predicateId: BigInt(4),
        objectId: BigInt(new Date(endDate).getTime() || 0),
      },
    ];

    const prizeTriples = prizes.map((prize, index) => ({
      subjectId: BigInt(5 + index),
      predicateId: BigInt(6),
      objectId: BigInt(prize.amount || 0),
    }));

    const compositionTriples = prizes.map((prize, index) => ({
      subjectId: BigInt(1),
      predicateId: BigInt(7),
      objectId: BigInt(5 + index),
    }));

    const allTriples = [...mainTriples, ...prizeTriples, ...compositionTriples];
    setTriples(allTriples);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      if (!authenticated) {
        await login();
        return;
      }

      // Créer les triples un par un
      for (const triple of triples) {
        const hash = await createTriples({
          address: MULTIVAULT_CONTRACT_ADDRESS,
          abi: multivaultAbi,
          functionName: 'createTriple',
          args: [
            triple.subjectId,
            triple.predicateId,
            triple.objectId
          ],
          value: BigInt(230000002000000)
        });
        console.log("Transaction hash:", hash);
      }

      setShowConfirmation(false);
      navigate('/app/hackathons');
    } catch (error) {
      console.error('Transaction error:', error);
    }
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
    const updatedPrizes = prizes.map(prize => ({
      ...prize,
      percent: value > 0 ? (prize.amount / value) * 100 : 0
    }));
    setPrizes(updatedPrizes);
  };

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

  // Ajoutez cette fonction helper
  const formatTriplesForDisplay = (triples: any[]) => {
    const getPredicateName = (id: string) => {
      switch (id) {
        case "2": return "total cash prize";
        case "3": return "starts on";
        case "4": return "ends on";
        case "6": return "is";
        case "7": return "is composed of";
        default: return id;
      }
    };

    const getObjectValue = (triple: any) => {
      const predicateId = triple.predicateId.toString();
      const objectId = triple.objectId.toString();

      switch (predicateId) {
        case "2": return `$${objectId}`; // Cash prize
        case "3": 
        case "4": return new Date(parseInt(objectId)).toLocaleDateString(); // Dates
        case "6": return `$${objectId}`; // Prize amounts
        case "7": {
          // Pour "is composed of", on récupère le prix correspondant
          const prizeIndex = parseInt(objectId) - 5;
          const prize = prizes[prizeIndex];
          if (prize) {
            const prizeName = prize.name === 'Other' ? prize.otherName : prize.name;
            return `${prizeName} is $${prize.amount}`;
          }
          return objectId;
        }
        default: return objectId;
      }
    };

    const getSubjectName = (triple: any) => {
      const subjectId = triple.subjectId.toString();
      if (subjectId === "1") return hackathonTitle;
      if (parseInt(subjectId) >= 5) {
        const prize = prizes[parseInt(subjectId) - 5];
        // Si c'est un "Other" prize, on utilise le nom personnalisé
        if (prize?.name === 'Other') {
          return prize.otherName || "Other";
        }
        return prize?.name || subjectId;
      }
      return subjectId;
    };

    return triples.map(triple => ({
      subject: getSubjectName(triple),
      predicate: getPredicateName(triple.predicateId.toString()),
      object: getObjectValue(triple)
    }));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-xl font-bold">Submit a New Hackathon</h1>
        <Input
          startAdornment="Partner Name"
          value={partnerName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPartnerName(e.target.value)}
          required
        />
        <Input
          startAdornment="Hackathon Title"
          value={hackathonTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHackathonTitle(e.target.value)}
          required
        />
        <div className="flex flex-col">
          <label className="mb-1">Description</label>
          <Textarea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Enter a brief description of the hackathon"
            required
          />
        </div>
        <Input
          type="date"
          startAdornment="Start Date"
          value={startDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
          required
          min={tomorrow.toISOString().split("T")[0]}
        />
        <Input
          type="date"
          startAdornment="End Date"
          value={endDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
          required
          min={startDate ? new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : ''}
          disabled={!startDate || new Date(startDate) < today}
        />
        <Input
          startAdornment="Total Cash Prize"
          type="number"
          value={totalCashPrize.toString()}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTotalCashPrizeChange(parseInt(e.target.value))}
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
            prizes={prizes}
            prizesNumber={prizes.length}
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
      
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm Triples Creation</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(formatTriplesForDisplay(triples), null, 2)}
            </pre>
          </div>
          <Button onClick={handleConfirm}>Confirm & Sign</Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubmitHackathon;