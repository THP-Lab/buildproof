import { useState, useMemo } from 'react';
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
    Input
} from '@0xintuition/buildproof_ui';
import { handleSliderChange, resetSingleSlider, resetAllSliders } from './handleSliderChange';
import { sortItems } from './sortItems';
import type { VoteItem } from './types';
import { VotingPageView } from './VotingPageView';
import type { GetTriplesWithPositionsQuery } from '@0xintuition/graphql';
import { useBatchDepositTriple } from '../../lib/hooks/useBatchDepositTriple'
import { calculateStakes } from '../../lib/utils/calculateStakes'
import { parseEther } from 'viem'

interface VotingPageProps {
    triplesData: GetTriplesWithPositionsQuery | undefined;
    userAddress: string | undefined;
}

export const VotingPage = ({ triplesData, userAddress }: VotingPageProps) => {
    const [selectedTab, setSelectedTab] = useState('voting');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // État pour les valeurs des sliders
    const [sliderValues, setSliderValues] = useState<{ [key: string]: number }>({});

    // Calculer les indices pour la pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    // Transform the GraphQL data into our VoteItem format
    const data: VoteItem[] = useMemo(() => {
        if (!triplesData?.triples) return [];
        
        return triplesData.triples.map((triple: any) => {
            const userVaultPosition = triple.vault?.positions?.[0];
            const userCounterVaultPosition = triple.counter_vault?.positions?.[0];

            return {
                id: triple.id,
                numPositionsFor: triple.vault?.position_count ?? 0,
                numPositionsAgainst: triple.counter_vault?.position_count ?? 0,
                totalTVL: (Number(triple.vault?.total_shares ?? 0) + Number(triple.counter_vault?.total_shares ?? 0)).toString(),
                tvlFor: triple.vault?.total_shares ?? '0',
                tvlAgainst: triple.counter_vault?.total_shares ?? '0',
                currency: 'ETH',
                subject: triple.subject?.label ?? '',
                predicate: triple.predicate?.label ?? '',
                object: triple.object?.label ?? '',
                votesCount: (triple.vault?.position_count ?? 0) + (triple.counter_vault?.position_count ?? 0),
                totalEth: Number(triple.vault?.total_shares ?? 0) + Number(triple.counter_vault?.total_shares ?? 0),
                userPosition: userVaultPosition?.shares ?? userCounterVaultPosition?.shares ?? undefined,
                positionDirection: userVaultPosition ? ClaimPosition.claimFor :
                    userCounterVaultPosition ? ClaimPosition.claimAgainst :
                        undefined
            };
        });
    }, [triplesData]);

    const currentItems = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const tabs = [
        { value: 'overview', label: 'Overview' },
        { value: 'voting', label: 'Voting' },
        { value: 'results', label: 'Results' },
    ];

    const [ethAmount, setEthAmount] = useState('0.001');
    const { batchDepositTriple, isPending } = useBatchDepositTriple()

    // Trier les items en fonction des valeurs des sliders
    const sortedItems = useMemo(() => sortItems(data, sliderValues), [data, sliderValues]);

    // Calculate total absolute value of all sliders
    const totalAbsoluteValue = useMemo(() => {
        return Object.values(sliderValues).reduce((sum, value) => sum + Math.abs(value), 0);
    }, [sliderValues]);

    // Check if total is exactly 100
    const canSubmit = totalAbsoluteValue === 100;

    // Handle submit function
    const handleSubmit = async () => {
        if (!userAddress || !ethAmount || !triplesData?.triples) return

        try {
            const totalStakeWei = parseEther(ethAmount)
            
            // Transform triples to include percentage from sliderValues
            const triplesWithPercentages = triplesData.triples.map(triple => ({
                id: triple.id,
                vault_id: triple.vault_id,
                counter_vault_id: triple.counter_vault_id,
                percentage: sliderValues[triple.id] || 0
            }))

            const stakes = calculateStakes(triplesWithPercentages, totalStakeWei)

            // Use hardcoded attestor address
            const attestorAddress = "0x64Abd54a86DfeB710eF2943d6304FC7B29f18e36"

            // Submit all stakes in one transaction
            if (stakes.ids.length > 0) {
                await batchDepositTriple(
                    {
                        receiver: userAddress as `0x${string}`,
                        ids: stakes.ids,
                        values: stakes.values,
                        attestorAddress: attestorAddress as `0x${string}`
                    },
                    { value: totalStakeWei }
                )
            }

            // Handle success (e.g., show notification, reset form, etc.)
        } catch (error) {
            console.error('Error submitting stakes:', error)
            // Handle error (e.g., show error notification)
        }
    };

    return (
        <VotingPageView
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            tabs={tabs}
            ethAmount={ethAmount}
            setEthAmount={setEthAmount}
            totalAbsoluteValue={totalAbsoluteValue}
            resetAllSliders={() => resetAllSliders(setSliderValues)}
            sortedItems={sortedItems}
            sliderValues={sliderValues}
            resetSingleSlider={(id) => resetSingleSlider(id, sliderValues, setSliderValues)}
            handleSliderChange={(id, value) => handleSliderChange(id, value, sliderValues, setSliderValues)}
            canSubmit={canSubmit}
            handleSubmit={handleSubmit}
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage.toString()}
            setRowsPerPage={(value) => setRowsPerPage(Number(value))}
            setCurrentPage={setCurrentPage}
            data={data}
        />
    );
}; 