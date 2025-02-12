import { useState, useMemo, useEffect, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import {
    ClaimRow,
    Claim,
    SegmentedControl,
    SegmentedControlItem,
    EmptyStateCard,
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
    PaginationSummary,
    PaginationRowSelection,
    PaginationPageCounter,
    PaginationFirst,
    PaginationLast,
    ClaimPosition,
    MultiSlider,
    cn,
    Button,
    Input,
    CurrencyType,
    Switch
} from '@0xintuition/buildproof_ui';
import {
    handleSliderChange as handleSliderChangeWithValidation,
    resetSingleSlider as resetSingleSliderWithValidation,
    resetAllSliders as resetAllSlidersWithValidation
} from './handleSliderChange';
import { sortItems } from './sortItems';
import type { VoteItem, SupportedCurrency } from './types';
import { VotingPageView } from './VotingPageView';
import type { GetTriplesWithPositionsQuery } from '@0xintuition/graphql';
import { useBatchDepositTriple } from '../../lib/hooks/useBatchDepositTriple'
import { calculateStakes } from '../../lib/utils/calculateStakes'
import { parseEther, formatUnits } from 'viem'
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface VotingPageProps {
    triplesData: GetTriplesWithPositionsQuery | undefined;
    userAddress: string | undefined;
}

interface EthPriceResponse {
    price: string;
}

export const VotingPage = ({ triplesData, userAddress }: VotingPageProps) => {
    const [selectedTab, setSelectedTab] = useState('voting');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currency, setCurrency] = useState<SupportedCurrency>('ETH');
    
    // Calculate total existing positions and initialize states
    const [ethAmount, setEthAmount] = useState(() => {
        if (!triplesData?.triples) return '0.001';
        
        const totalPositions = triplesData.triples.reduce((total, triple) => {
            const userVaultPosition = triple.vault?.positions?.[0];
            const userCounterVaultPosition = triple.counter_vault?.positions?.[0];
            const vaultAmount = userVaultPosition ? Number(formatUnits(BigInt(userVaultPosition.shares), 18)) : 0;
            const counterVaultAmount = userCounterVaultPosition ? Number(formatUnits(BigInt(userCounterVaultPosition.shares), 18)) : 0;
            return total + vaultAmount + counterVaultAmount;
        }, 0);

        return totalPositions > 0 ? totalPositions.toString() : '0.001';
    });

    // Calculate initial slider values
    const initialSliderValues = (() => {
        if (!triplesData?.triples) return {};
        
        const totalEth = Number(ethAmount);
        if (totalEth === 0) return {};

        return triplesData.triples.reduce((values, triple) => {
            const userVaultPosition = triple.vault?.positions?.[0];
            const userCounterVaultPosition = triple.counter_vault?.positions?.[0];
            
            const vaultAmount = userVaultPosition ? Number(formatUnits(BigInt(userVaultPosition.shares), 18)) : 0;
            const counterVaultAmount = userCounterVaultPosition ? Number(formatUnits(BigInt(userCounterVaultPosition.shares), 18)) : 0;
            
            const totalPosition = vaultAmount + counterVaultAmount;
            if (totalPosition > 0) {
                const percentage = Math.round((totalPosition / totalEth) * 100 * 100) / 100;
                values[triple.id] = vaultAmount > 0 ? percentage : -percentage;
            }
            
            return values;
        }, {} as { [key: string]: number });
    })();

    const [sliderValues, setSliderValues] = useState(initialSliderValues);
    const [debouncedSliderValues, setDebouncedSliderValues] = useState(initialSliderValues);

    const [displayAmount, setDisplayAmount] = useState(ethAmount);
    const [ethPrice, setEthPrice] = useState('0');

    // État pour les valeurs des sliders
    const [sortedItemIds, setSortedItemIds] = useState<string[]>([]);
    
    // Create a subject for slider changes
    const sliderSubject = useRef(new Subject<{ id: string; value: number }>());

    // Fetch ETH price
    const ethPriceFetcher = useFetcher<EthPriceResponse>();
    
    useEffect(() => {
        // Initial fetch only
        ethPriceFetcher.load('/resources/eth-price');
    }, []);

    useEffect(() => {
        if (ethPriceFetcher.data?.price) {
            setEthPrice(ethPriceFetcher.data.price);
        }
    }, [ethPriceFetcher.data]);
    const convertValue = (value: string, fromCurrency: SupportedCurrency, toCurrency: SupportedCurrency): string => {
        if (!value) return '0';
        if (fromCurrency === toCurrency) return value;
        const numValue = Number(value);
        
        if (fromCurrency === 'ETH' && toCurrency === '$') {
            const result = (numValue * Number(ethPrice));
            return isNaN(result) ? '0' : result.toString();
        } else {
            const result = (numValue / Number(ethPrice));
            return isNaN(result) ? '0' : result.toString();
        }
    };

    // Transform the GraphQL data into our VoteItem format
    const data: VoteItem[] = useMemo(() => {
        if (!triplesData?.triples) return [];
        
        return triplesData.triples.map((triple: any) => {
            const userVaultPosition = triple.vault?.positions?.[0];
            const userCounterVaultPosition = triple.counter_vault?.positions?.[0];
            
            const totalShares = (Number(triple.vault?.total_shares ?? 0) + Number(triple.counter_vault?.total_shares ?? 0)).toString();
            const vaultShares = triple.vault?.total_shares ?? '0';
            const counterVaultShares = triple.counter_vault?.total_shares ?? '0';

            // Récupérer les positions de l'utilisateur
            const userVaultShares = userVaultPosition?.shares ?? '0';
            const userCounterVaultShares = userCounterVaultPosition?.shares ?? '0';

            // Déterminer la direction et le montant de la position
            let positionDirection;
            let userPosition;
            if (Number(userVaultShares) > 0) {
                positionDirection = ClaimPosition.claimFor;
                userPosition = userVaultShares;
            } else if (Number(userCounterVaultShares) > 0) {
                positionDirection = ClaimPosition.claimAgainst;
                userPosition = userCounterVaultShares;
            }

            return {
                id: triple.id,
                numPositionsFor: triple.vault?.position_count ?? 0,
                numPositionsAgainst: triple.counter_vault?.position_count ?? 0,
                totalTVL: totalShares,
                tvlFor: vaultShares,
                tvlAgainst: counterVaultShares,
                currency: currency,
                subject: triple.subject?.label ?? '',
                predicate: triple.predicate?.label ?? '',
                object: triple.object?.label ?? '',
                votesCount: (triple.vault?.position_count ?? 0) + (triple.counter_vault?.position_count ?? 0),
                totalEth: Number(totalShares),
                userPosition,
                positionDirection
            };
        });
    }, [triplesData, currency, ethPrice]);

    // Set up the subscription when the component mounts
    useEffect(() => {
        const subscription = sliderSubject.current.pipe(
            distinctUntilChanged((prev, curr) => 
                prev.id === curr.id && prev.value === curr.value
            )
        ).subscribe(({ id, value }) => {
            setDebouncedSliderValues(prev => ({
                ...prev,
                [id]: value
            }));
        });

        return () => subscription.unsubscribe();
    }, []);

    // Effect to sort items when debounced values change
    useEffect(() => {
        const sortedItems = sortItems(data, debouncedSliderValues);
        const sortedIds = sortedItems.map(item => item.id);
        setSortedItemIds(sortedIds);
    }, [debouncedSliderValues, data]);

    // Use sorted IDs to maintain order
    const sortedItems = useMemo(() => {
        return sortedItemIds.map(id => data.find(item => item.id === id)).filter(Boolean) as VoteItem[];
    }, [data, sortedItemIds]);

    // Appliquer la pagination sur les données triées
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return sortedItems.slice(startIndex, endIndex);
    }, [sortedItems, currentPage, rowsPerPage]);

    // Calculer le nombre total de pages basé sur les items triés
    const totalPages = useMemo(() => Math.ceil(sortedItems.length / rowsPerPage), [sortedItems.length, rowsPerPage]);

    const tabs = [
        { value: 'overview', label: 'Overview' },
        { value: 'voting', label: 'Voting' },
        { value: 'results', label: 'Results' },
    ];

    const { batchDepositTriple, isPending } = useBatchDepositTriple();

    // Update display amount when currency changes
    useEffect(() => {
        setDisplayAmount(convertValue(ethAmount, 'ETH', currency));
    }, [currency, ethAmount]);

    // Calculate minimum amount from user positions
    const minimumAmount = useMemo(() => {
        if (!triplesData?.triples) return 0;
        
        return triplesData.triples.reduce((total, triple) => {
            const userVaultPosition = triple.vault?.positions?.[0];
            const userCounterVaultPosition = triple.counter_vault?.positions?.[0];
            const vaultAmount = userVaultPosition ? Number(formatUnits(BigInt(userVaultPosition.shares), 18)) : 0;
            const counterVaultAmount = userCounterVaultPosition ? Number(formatUnits(BigInt(userCounterVaultPosition.shares), 18)) : 0;
            return total + vaultAmount + counterVaultAmount;
        }, 0);
    }, [triplesData]);

    // Handle input amount change
    const handleAmountChange = (value: string) => {
        const newAmount = currency === 'ETH' ? value : convertValue(value, '$', 'ETH');
        const newAmountNum = Number(newAmount);
        
        // Don't allow amount below minimum
        if (newAmountNum < minimumAmount) {
            const minAmountStr = minimumAmount.toString();
            if (currency === 'ETH') {
                setEthAmount(minAmountStr);
                setDisplayAmount(minAmountStr);
            } else {
                setDisplayAmount(convertValue(minAmountStr, 'ETH', '$'));
                setEthAmount(minAmountStr);
            }
            return;
        }

        const oldAmount = ethAmount;
        
        // Update the amounts
        if (currency === 'ETH') {
            setEthAmount(value);
            setDisplayAmount(value);
        } else {
            setDisplayAmount(value);
            setEthAmount(newAmount);
        }

        // If we have existing positions, adjust their percentages proportionally
        if (Object.keys(sliderValues).length > 0) {
            const ratio = Number(oldAmount) / newAmountNum;
            const newSliderValues = Object.entries(sliderValues).reduce((acc, [id, value]) => {
                // Adjust each percentage proportionally
                const newValue = Math.round((value * ratio) * 100) / 100;
                acc[id] = newValue;
                return acc;
            }, {} as { [key: string]: number });

            setSliderValues(newSliderValues);
            setDebouncedSliderValues(newSliderValues);
        }
    };

    // Calculate total based on immediate values for UI feedback
    const totalAbsoluteValue = useMemo(() => {
        const total = Object.values(sliderValues).reduce((sum, value) => sum + Math.abs(value), 0);
        return Math.round(total * 100) / 100;
    }, [sliderValues]);

    // Check if total is exactly 100
    const canSubmit = totalAbsoluteValue === 100;

    const toggleCurrency = () => {
        setCurrency(prev => {
            const newCurrency = prev === 'ETH' ? '$' : 'ETH';
            setDisplayAmount(convertValue(ethAmount, 'ETH', newCurrency));
            return newCurrency;
        });
    };

    // Handle submit function
    const handleSubmit = async () => {
        if (!userAddress || !ethAmount || !triplesData?.triples) return;

        try {
            // Calculer le montant total initial
            const initialTotal = triplesData.triples.reduce((total, triple) => {
                const userVaultPosition = triple.vault?.positions?.[0];
                const userCounterVaultPosition = triple.counter_vault?.positions?.[0];
                const vaultAmount = userVaultPosition ? Number(formatUnits(BigInt(userVaultPosition.shares), 18)) : 0;
                const counterVaultAmount = userCounterVaultPosition ? Number(formatUnits(BigInt(userCounterVaultPosition.shares), 18)) : 0;
                return total + vaultAmount + counterVaultAmount;
            }, 0);

            // Calculer le montant à répartir (différence entre nouvel input et input initial)
            const amountToDistribute = Number(ethAmount) - initialTotal;

            // Calculer le pourcentage total initial
            const totalInitialPercentage = triplesData.triples.reduce((total, triple) => {
                const userVaultPosition = triple.vault?.positions?.[0];
                const userCounterVaultPosition = triple.counter_vault?.positions?.[0];
                const vaultAmount = userVaultPosition ? Number(formatUnits(BigInt(userVaultPosition.shares), 18)) : 0;
                const counterVaultAmount = userCounterVaultPosition ? Number(formatUnits(BigInt(userCounterVaultPosition.shares), 18)) : 0;
                const totalAmount = vaultAmount + counterVaultAmount;
                return total + (totalAmount > 0 ? (totalAmount / Number(ethAmount)) * 100 : 0);
            }, 0);

            // Calculer le pourcentage restant disponible
            const remainingPercentage = 100 - totalInitialPercentage;

            // Transform triples to include percentage from sliderValues and calculate exact amounts
            const triplesWithPercentages = triplesData.triples.map(triple => {
                const userVaultPosition = triple.vault?.positions?.[0];
                const userCounterVaultPosition = triple.counter_vault?.positions?.[0];
                
                const sliderValue = sliderValues[triple.id] || 0;
                const truncatedPercentage = Math.floor(Math.abs(sliderValue));
                
                // Calculer le pourcentage initial de ce claim
                const vaultAmount = userVaultPosition ? Number(formatUnits(BigInt(userVaultPosition.shares), 18)) : 0;
                const counterVaultAmount = userCounterVaultPosition ? Number(formatUnits(BigInt(userCounterVaultPosition.shares), 18)) : 0;
                const totalAmount = vaultAmount + counterVaultAmount;
                const initialPercentage = totalAmount > 0 ? (totalAmount / Number(ethAmount)) * 100 : 0;

                // Si le pourcentage a changé, calculer le montant à ajouter
                if (truncatedPercentage > initialPercentage) {
                    // Calculer quelle part du pourcentage restant ce claim prend
                    const percentageOfRemaining = (truncatedPercentage - initialPercentage) / remainingPercentage;
                    // Calculer le montant à ajouter basé sur cette part
                    const amountToAdd = amountToDistribute * percentageOfRemaining;

                    return {
                        id: triple.id,
                        vault_id: triple.vault_id,
                        counter_vault_id: triple.counter_vault_id,
                        percentage: sliderValue > 0 ? truncatedPercentage : -truncatedPercentage,
                        amountToAdd: parseEther(amountToAdd.toFixed(18))
                    } as const;
                }
                return null;
            }).filter((triple): triple is NonNullable<typeof triple> => triple !== null);

            // Pas besoin de calculateStakes puisqu'on a déjà les montants exacts
            const stakes = {
                ids: triplesWithPercentages.map(t => BigInt(t.percentage > 0 ? t.vault_id : t.counter_vault_id)),
                values: triplesWithPercentages.map(t => t.amountToAdd)
            };

            // Calculate the total value to send (sum of stakes)
            const totalValueToSend = stakes.values.reduce((sum, value) => sum + value, 0n);

            // Use hardcoded attestor address
            const attestorAddress = "0x64Abd54a86DfeB710eF2943d6304FC7B29f18e36";

            // Submit all stakes in one transaction
            if (stakes.ids.length > 0) {
                await batchDepositTriple(
                    {
                        receiver: userAddress as `0x${string}`,
                        ids: stakes.ids,
                        values: stakes.values,
                        attestorAddress: attestorAddress as `0x${string}`
                    },
                    { value: totalValueToSend }
                );
            }

            // Handle success (e.g., show notification, reset form, etc.)
        } catch (error) {
            console.error('Error submitting stakes:', error);
            // Handle error (e.g., show error notification)
        }
    };

    const handleResetSlider = (id: string) => {
        resetSingleSliderWithValidation(id, setSliderValues);
        // Déclencher le tri comme pour les changements de slider
        sliderSubject.current.next({ id, value: 0 });
    };

    return (
        <VotingPageView
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            tabs={tabs}
            ethAmount={displayAmount}
            setEthAmount={handleAmountChange}
            totalAbsoluteValue={totalAbsoluteValue}
            resetAllSliders={() => resetAllSlidersWithValidation(setSliderValues)}
            sortedItems={paginatedItems}
            sliderValues={sliderValues}
            resetSingleSlider={handleResetSlider}
            handleSliderChange={(id, value) => handleSliderChangeWithValidation(id, value, sliderValues, setSliderValues)}
            handleSliderCommit={(id, value) => {
                handleSliderChangeWithValidation(id, value, sliderValues, setSliderValues);
                sliderSubject.current.next({ id, value });
            }}
            canSubmit={canSubmit}
            handleSubmit={handleSubmit}
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage.toString()}
            setRowsPerPage={(value: string) => setRowsPerPage(Number(value))}
            setCurrentPage={setCurrentPage}
            data={data}
            currency={currency}
            onCurrencyToggle={toggleCurrency}
            setDebouncedSliderValues={setDebouncedSliderValues}
            userAddress={userAddress || ''}
            triplesData={triplesData}
        />
    );
}; 