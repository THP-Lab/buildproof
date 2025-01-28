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

export const VotingPage = () => {
    const [selectedTab, setSelectedTab] = useState('voting');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // État pour les valeurs des sliders
    const [sliderValues, setSliderValues] = useState<{ [key: string]: number }>({});

    // Calculer les indices pour la pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const [data] = useState<VoteItem[]>([
        {
            id: '1',
            numPositionsFor: 69,
            numPositionsAgainst: 42,
            totalTVL: '420.69',
            tvlFor: '240.69',
            tvlAgainst: '180',
            currency: 'ETH',
            userPosition: '3.19',
            positionDirection: ClaimPosition.claimFor,
            subject: '0xTeam-A',
            predicate: 'participates',
            object: 'Hackathon',
            votesCount: 76,
            totalEth: 420.69
        },
        {
            id: '2',
            numPositionsFor: 50,
            numPositionsAgainst: 50,
            totalTVL: '300.00',
            tvlFor: '150.00',
            tvlAgainst: '150.00',
            currency: 'ETH',
            subject: '0xTeam-B',
            predicate: 'participates',
            object: 'Hackathon',
            votesCount: 100,
            totalEth: 300.00
        },
        {
            id: '3',
            numPositionsFor: 80,
            numPositionsAgainst: 120,
            totalTVL: '500.00',
            tvlFor: '400.00',
            tvlAgainst: '100.00',
            currency: 'ETH',
            userPosition: '1.50',
            positionDirection: ClaimPosition.claimAgainst,
            subject: '0xTeam-C',
            predicate: 'participates',
            object: 'Hackathon',
            votesCount: 200,
            totalEth: 500.00
        },
        {
            id: '4',
            numPositionsFor: 69,
            numPositionsAgainst: 42,
            totalTVL: '420.69',
            tvlFor: '240.69',
            tvlAgainst: '180',
            currency: 'ETH',
            userPosition: '3.19',
            positionDirection: ClaimPosition.claimFor,
            subject: '0xTeam-D',
            predicate: 'participates',
            object: 'Hackathon',
            votesCount: 76,
            totalEth: 420.69
        },
        {
            id: '5',
            numPositionsFor: 50,
            numPositionsAgainst: 50,
            totalTVL: '300.00',
            tvlFor: '150.00',
            tvlAgainst: '150.00',
            currency: 'ETH',
            subject: '0xTeam-E',
            predicate: 'participates',
            object: 'Hackathon',
            votesCount: 100,
            totalEth: 300.00
        },
        {
            id: '6',
            numPositionsFor: 80,
            numPositionsAgainst: 120,
            totalTVL: '500.00',
            tvlFor: '400.00',
            tvlAgainst: '100.00',
            currency: 'ETH',
            userPosition: '1.50',
            positionDirection: ClaimPosition.claimAgainst,
            subject: '0xTeam-F',
            predicate: 'participates',
            object: 'Hackathon',
            votesCount: 200,
            totalEth: 500.00
        },        {
            id: '7',
            numPositionsFor: 69,
            numPositionsAgainst: 42,
            totalTVL: '420.69',
            tvlFor: '240.69',
            tvlAgainst: '180',
            currency: 'ETH',
            userPosition: '3.19',
            positionDirection: ClaimPosition.claimFor,
            subject: '0xTeam-G',
            predicate: 'participates',
            object: 'Hackathon',
            votesCount: 76,
            totalEth: 420.69
        },
        {
            id: '8',
            numPositionsFor: 50,
            numPositionsAgainst: 50,
            totalTVL: '300.00',
            tvlFor: '150.00',
            tvlAgainst: '150.00',
            currency: 'ETH',
            subject: '0xTeam-H',
            predicate: 'participates',
            object: 'Hackathon',
            votesCount: 100,
            totalEth: 300.00
        },
        {
            id: '9',
            numPositionsFor: 80,
            numPositionsAgainst: 120,
            totalTVL: '500.00',
            tvlFor: '400.00',
            tvlAgainst: '100.00',
            currency: 'ETH',
            userPosition: '1.50',
            positionDirection: ClaimPosition.claimAgainst,
            subject: '0xTeam-I',
            predicate: 'participates',
            object: 'Hackathon',
            votesCount: 200,
            totalEth: 500.00
        }
    ]);

    const currentItems = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const tabs = [
        { value: 'overview', label: 'Overview' },
        { value: 'voting', label: 'Voting' },
        { value: 'results', label: 'Results' },
    ];

    const [ethAmount, setEthAmount] = useState('0.001');

    // Trier les items en fonction des valeurs des sliders
    const sortedItems = useMemo(() => sortItems(data, sliderValues), [data, sliderValues]);

    // Calculate total absolute value of all sliders
    const totalAbsoluteValue = useMemo(() => {
        return Object.values(sliderValues).reduce((sum, value) => sum + Math.abs(value), 0);
    }, [sliderValues]);

    // Check if total is exactly 100
    const canSubmit = totalAbsoluteValue === 100;

    // Handle submit function
    const handleSubmit = () => {
        if (canSubmit) {
            console.log('Submitting votes:', sliderValues);
            // TODO: Implement actual vote submission
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