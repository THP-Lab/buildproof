import React, { useState, useEffect } from 'react';
import { Button, ButtonVariant, ButtonSize, Input, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle } from '@0xintuition/buildproof_ui';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from '@remix-run/react';
import { useBatchCreateTriple } from '../../lib/hooks/useBatchCreateTriple';
import { useBatchCreateAtom } from '../../lib/hooks/useBatchCreateAtom';
import PrizeDistribution from '../../components/prize-distribution';
import type { Prize } from '../../components/prize-distribution';
import { multivaultAbi } from '@lib/abis/multivault';
import { MULTIVAULT_CONTRACT_ADDRESS } from 'app/consts';
import { usePublicClient } from 'wagmi';
import { keccak256, toHex } from 'viem';

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
  const [validatedTriples, setValidatedTriples] = useState<any[]>([]);
  const publicClient = usePublicClient();
  const { writeContractAsync: writeBatchCreateAtom } = useBatchCreateAtom();

  const {
    writeContractAsync: writeBatchCreateTriple,
    awaitingWalletConfirmation,
    awaitingOnChainConfirmation,
  } = useBatchCreateTriple()

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

  const checkAtomExists = async (value: string): Promise<bigint | null> => {
    if (!publicClient) return null;
    
    try {
      const atomHash = keccak256(toHex(value));
      const atomId = await publicClient.readContract({
        address: MULTIVAULT_CONTRACT_ADDRESS,
        abi: multivaultAbi,
        functionName: 'atomsByHash',
        args: [atomHash]
      });
      return BigInt(atomId as number);
    } catch (error) {
      return null;
    }
  };

  const createMissingAtoms = async (atomValues: string[]) => {
    if (atomValues.length === 0) return null;
    
    try {
      const valuePerAtom = BigInt("1000000000000000"); // 0.001 ETH par atome
      const hash = await writeBatchCreateAtom({
        address: MULTIVAULT_CONTRACT_ADDRESS,
        abi: multivaultAbi,
        functionName: 'batchCreateAtom',
        args: [atomValues.map(v => toHex(v))],
        value: valuePerAtom * BigInt(atomValues.length)
      });
      
      return hash;
    } catch (error) {
      console.error('Error creating atoms:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Préparer les données pour la validation
    const atomsToCheck = [
      hackathonTitle,
      'starts_on',
      'ends_on',
      'has_prize',
      ...prizes.map(prize => prize.name)
    ];

    // Vérifier l'existence des atomes
    const atomResults = await Promise.all(
      atomsToCheck.map(async (value) => ({
        value,
        id: await checkAtomExists(value)
      }))
    );

    // Identifier les atomes manquants
    const missingAtoms = atomResults.filter(result => !result.id).map(result => result.value);

    // Créer les triples à valider
    const triplesToValidate = [
      {
        subject: hackathonTitle,
        predicate: 'starts_on',
        object: startDate,
        displayValue: new Date(startDate).toLocaleDateString()
      },
      {
        subject: hackathonTitle,
        predicate: 'ends_on',
        object: endDate,
        displayValue: new Date(endDate).toLocaleDateString()
      },
      ...prizes.map(prize => ({
        subject: hackathonTitle,
        predicate: 'has_prize',
        object: prize.name,
        displayValue: `${prize.name} ($${prize.amount})`
      }))
    ];

    setTriples(triplesToValidate);
    setValidatedTriples(triplesToValidate);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      if (!authenticated) {
        await login();
        return;
      }

      // 1. Créer d'abord les atomes manquants
      const atomsToCreate = [
        hackathonTitle,
        'starts_on',
        'ends_on',
        'has_prize',
        ...prizes.map(prize => prize.name)
      ];

      // Première vérification des atomes existants
      const existingAtomIds = await Promise.all(
        atomsToCreate.map(value => checkAtomExists(value))
      );

      const missingAtoms = atomsToCreate.filter((_, index) => !existingAtomIds[index]);
      
      if (missingAtoms.length > 0) {
        console.log('Creating missing atoms:', missingAtoms);
        const atomsHash = await createMissingAtoms(missingAtoms);
        if (atomsHash) {
          await publicClient?.waitForTransactionReceipt({ hash: atomsHash });
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // 2. Vérifier que tous les atomes existent maintenant
      let retryCount = 0;
      let allAtomsExist = false;
      let atomIds: (bigint | null)[] = [];

      while (retryCount < 3 && !allAtomsExist) {
        atomIds = await Promise.all(
          atomsToCreate.map(value => checkAtomExists(value))
        );
        
        allAtomsExist = atomIds.every(id => id !== null);
        if (!allAtomsExist) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          retryCount++;
        }
      }

      const [titleId, startsOnId, endsOnId, hasPrizeId, ...prizeIds] = atomIds;

      if (!titleId || !startsOnId || !endsOnId || !hasPrizeId) {
        throw new Error('Failed to create or retrieve required atoms. Please try again.');
      }

      // 3. Créer les triples avec des dates simplifiées
      const triplesToCreate = [
        {
          subjectId: titleId,
          predicateId: startsOnId,
          objectId: BigInt(new Date(startDate).getDate()) // Juste le jour du mois
        },
        {
          subjectId: titleId,
          predicateId: endsOnId,
          objectId: BigInt(new Date(endDate).getDate()) // Juste le jour du mois
        },
        ...prizes.map((prize, index) => {
          const prizeId = prizeIds[index];
          if (!prizeId) throw new Error(`Prize ID not found for ${prize.name}`);
          return {
            subjectId: titleId,
            predicateId: hasPrizeId,
            objectId: prizeId
          };
        })
      ];

      console.log('Creating triples:', triplesToCreate);

      // 4. Créer les triples en une seule transaction avec une valeur plus élevée
      const valuePerTriple = BigInt("1000000000000000"); // 0.001 ETH par triple
      const triplesHash = await writeBatchCreateTriple({
        address: MULTIVAULT_CONTRACT_ADDRESS,
        abi: multivaultAbi,
        functionName: 'batchCreateTriple',
        args: [
          triplesToCreate.map(t => t.subjectId),
          triplesToCreate.map(t => t.predicateId),
          triplesToCreate.map(t => t.objectId)
        ],
        value: valuePerTriple * BigInt(triplesToCreate.length)
      });

      await publicClient?.waitForTransactionReceipt({ hash: triplesHash });
      setShowConfirmation(false);
      navigate('/app/hackathons');
    } catch (error) {
      console.error('Transaction error:', error);
      alert(error instanceof Error ? error.message : 'Transaction failed. Please try again.');
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
    return triples.map(triple => ({
      subject: triple.subject,
      predicate: triple.predicate,
      object: triple.displayValue || triple.object
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