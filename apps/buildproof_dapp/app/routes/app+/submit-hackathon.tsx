import React, { useState, useEffect } from 'react';
import { Button, ButtonVariant, ButtonSize, Input, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle } from '@0xintuition/buildproof_ui';
import { usePrivy } from '@privy-io/react-auth';
import { useNavigate, useLoaderData } from '@remix-run/react';
import { useBatchCreateTriple } from '../../lib/hooks/useBatchCreateTriple';
import { useBatchCreateAtom } from '../../lib/hooks/useBatchCreateAtom';
import PrizeDistribution from '../../components/submit-hackathon/prize-distribution';
import type { Prize } from '../../components/submit-hackathon/prize-distribution';
import { multivaultAbi } from '@lib/abis/multivault';
import { MULTIVAULT_CONTRACT_ADDRESS } from 'app/consts';
import { usePublicClient } from 'wagmi';
import { keccak256, toHex } from 'viem';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { hashDataToIPFS } from '../../utils/ipfs-utils';

export async function loader({ request }: LoaderFunctionArgs) {
  // Vérifier si la variable est définie dans l'environnement
  const pinataJwt = process.env.PINATA_JWT_KEY;
  
  // Si la variable n'est pas définie, on retourne quand même mais avec une valeur null
  // Cela nous permettra de gérer l'erreur côté client de manière plus élégante
  return json({
    env: {
      PINATA_JWT: pinataJwt || null
    }
  });
}

const SubmitHackathon = () => {
  const { env } = useLoaderData<typeof loader>();
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

  const checkTripleExists = async (subject: string | number | bigint, predicate: string | number | bigint, object: string | number | bigint): Promise<bigint | null> => {
    if (!publicClient) return null;
    
    try {
      // Convert components to atom IDs if they are strings
      const subjectId = typeof subject === 'string' ? await checkAtomExists(subject) : BigInt(subject.toString());
      const predicateId = typeof predicate === 'string' ? await checkAtomExists(predicate) : BigInt(predicate.toString());
      const objectId = typeof object === 'string' ? await checkAtomExists(object) : BigInt(object.toString());

      if (!subjectId || !predicateId || !objectId) {
        return null;
      }

      const exists = await publicClient.readContract({
        address: MULTIVAULT_CONTRACT_ADDRESS,
        abi: multivaultAbi,
        functionName: 'isTriple',
        args: [subjectId, predicateId, objectId]
      }) as boolean;
      
      if (exists) {
        // Si le triple existe, on retourne un ID non-null (1n)
        // L'ID exact n'est pas important puisqu'on vérifie juste l'existence
        return 1n;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking triple:', error);
      return null;
    }
  };

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
      'has tag',
      'BP_test',
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
        predicate: 'has tag',
        object: 'BP_test'
      },
      {
        subject: hackathonTitle,
        predicate: 'Total Cash Prize',
        object: totalCashPrize
      },
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

      // ...prizes.map(prize => ({
      //   subject: prize.name,
      //   predicate: 'is',
      //   object: prize.amount
      // })),
      
      ...prizes.map(prize => {
        if (prize.name === 'Other') {
          // Get the names of the other prizes
          const otherPrizeNames = prizes
            .filter(p => p.name !== 'Other')
            .map(p => p.name);

          return {
            subject: hackathonTitle,
            predicate:  prize.otherName || otherPrizeNames[0] || 'Other',
            object: prize.amount
          };
        } else {
          return {
            subject: hackathonTitle,
            predicate: prize.name,
            object: prize.amount
          };
        }
      })
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

      // 0. Vérifier PINATA_JWT
      if (!env.PINATA_JWT) {
        throw new Error('PINATA_JWT is not configured. Please contact the administrator.');
      }

      // 1. D'abord, on stocke les données sur IPFS
      const hackathonData = {
        partnerName,
        name: hackathonTitle,
        description
      };

      // Utiliser la fonction hashDataToIPFS
      const { value: nameValue, ipfsHash: nameIpfsHash } = await hashDataToIPFS(hackathonTitle, env.PINATA_JWT);
      const { ipfsHash } = await hashDataToIPFS(hackathonData, env.PINATA_JWT);

      // 3. Créer les atoms pour les données IPFS et les autres atoms nécessaires
      const startDateStr = new Date(startDate).toLocaleDateString();
      const endDateStr = new Date(endDate).toLocaleDateString();
      const prizeAmounts = prizes.map(prize => prize.amount.toString());
      const totalCashPrizeStr = totalCashPrize.toString();
      const otherPlaceNames = prizes
        .filter(prize => prize.name === 'Other' && prize.otherName)
        .map(prize => prize.otherName as string);

      const atomsToCreate = [
        ipfsHash,
        'has tag',
        'starts_on',
        'ends_on',
        'BP_test',
        'First Place',
        'Second Place',
        'Third Place',
        ...otherPlaceNames,
        'total cash prize',
        startDateStr,
        endDateStr,
        totalCashPrizeStr,
        ...prizeAmounts
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

      // 4. Vérifier que tous les atomes existent maintenant
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

      const [ipfsHashId, hasTagId, startsOnId, endsOnId,  bpTestId, firstPlaceId, secondPlaceId, thirdPlaceId, ...remainingIds] = atomIds;
      const otherPlaceIds =remainingIds.slice(0, otherPlaceNames.length);
      const [ totalCashPrizePredicateId, startDateId, endDateId, totalCashPrizeAmountId, ...prizeAmountIds] = remainingIds.slice(otherPlaceNames.length);

      if ( !ipfsHashId || !hasTagId || !startsOnId || !endsOnId || !bpTestId || !firstPlaceId || !totalCashPrizePredicateId || !startDateId || !endDateId || !totalCashPrizeAmountId ) {
        throw new Error('Failed to create or retrieve required atoms. Please try again.');
      }

      // 5. Créer les triples avec des dates simplifiées
      const triplesToCreate = [
        {
          subjectId: ipfsHashId,
          predicateId: 3,
          objectId: bpTestId
        },
        {
          subjectId: ipfsHashId,
          predicateId: startsOnId,
          objectId: startDateId
        },
        {
          subjectId: ipfsHashId,
          predicateId: endsOnId,
          objectId: endDateId
        },
        {
          subjectId: ipfsHashId,
          predicateId: totalCashPrizePredicateId,
          objectId: totalCashPrizeAmountId
        },
        ...prizes.map((prize, index) => {
          const prizeId = prizeAmountIds[index];
          if (!prizeId) throw new Error(`Prize ID not found for ${prize.name}`);

          let predicateId;
      switch(prize.name) {
        case 'First Place':
          predicateId = firstPlaceId;
          break;
        case 'Second Place':
          predicateId = secondPlaceId;
          break;
        case 'Third Place':
            predicateId = thirdPlaceId;
            break;
        case 'Other':
          const otherIndex = prizes
            .filter(p => p.name === 'Other')
            .findIndex(p => p.otherName === prize.otherName);
          if (otherIndex === -1 || !otherPlaceIds[otherIndex]) {
            throw new Error(`Predicate ID not found for Other prize: ${prize.otherName}`);
          }
          predicateId = otherPlaceIds[otherIndex];
          break;
        default:
          throw new Error(`Unknown prize type: ${prize.name}`);
      }
          return {
            subjectId: ipfsHashId,
            predicateId: predicateId,
            objectId: prizeAmountIds[index]
          };
        })
      ];

      console.log('Creating triples:', triplesToCreate);

      // 6. Créer les triples en une seule transaction
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