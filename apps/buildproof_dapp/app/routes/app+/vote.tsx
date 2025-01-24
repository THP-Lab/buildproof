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
    Button
} from '@0xintuition/buildproof_ui';

const VotingPage = () => {
    const [selectedTab, setSelectedTab] = useState('voting');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // État pour les valeurs des sliders
    const [sliderValues, setSliderValues] = useState<{ [key: string]: number }>({});

    // Calculer les indices pour la pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const [data] = useState([
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

    // Fonction pour gérer les changements de valeur des sliders
    const handleSliderChange = (itemId: string, newValue: number) => {
        // Calculer la somme des valeurs absolues des autres sliders
        const otherValuesSum = Object.entries(sliderValues)
            .filter(([id]) => id !== itemId)
            .reduce((sum, [, value]) => sum + Math.abs(value), 0);

        // Vérifier si la nouvelle valeur ferait dépasser 100% au total
        if (Math.abs(newValue) + otherValuesSum > 100) {
            // Si on dépasse, on limite la valeur tout en gardant le signe
            const maxAllowedValue = 100 - otherValuesSum;
            const clampedValue = newValue > 0 ? maxAllowedValue : -maxAllowedValue;
            setSliderValues(prev => ({
                ...prev,
                [itemId]: clampedValue
            }));
            alert('The total value cannot exceed 100% !');
        } else {
            setSliderValues(prev => ({
                ...prev,
                [itemId]: newValue
            }));
        }
    };

    // Trier les items en fonction des valeurs des sliders
    const sortedItems = useMemo(() => {
        return [...data].sort((a, b) => {
            const valueA = sliderValues[a.id] || 0;
            const valueB = sliderValues[b.id] || 0;
            
            // Si l'un est zéro et l'autre non, le zéro va en dernier
            if (valueA === 0 && valueB !== 0) return 1;
            if (valueA !== 0 && valueB === 0) return -1;
            
            // Si l'un est positif et l'autre négatif, le positif va en premier
            if ((valueA > 0 && valueB < 0) || (valueA < 0 && valueB > 0)) {
                return valueB - valueA;
            }
            
            // Si les deux sont positifs, on trie par ordre décroissant
            if (valueA > 0 && valueB > 0) {
                return valueB - valueA;
            }
            
            // Si les deux sont négatifs, on trie par ordre croissant
            if (valueA < 0 && valueB < 0) {
                return valueB - valueA;
            }
            
            return 0;
        });
    }, [data, sliderValues]);

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
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Navigation par onglets */}
            <SegmentedControl>
                {tabs.map((tab, index) => (
                    <SegmentedControlItem
                        key={index}
                        isActive={selectedTab === tab.value}
                        onClick={() => setSelectedTab(tab.value)}
                    >
                        {tab.label}
                    </SegmentedControlItem>
                ))}
            </SegmentedControl>

            {/* Carte d'explication */}
            <EmptyStateCard
                title="How to Vote"
                message="Use the sliders to allocate your voting power. Positive values support a project, negative values oppose it. The total absolute values cannot exceed 100%."
                className="mb-6"
            />

            {/* Liste des Claims */}
            <div className="space-y-8">
                {/* Sliders avec des valeurs non nulles */}
                <div className="space-y-4">
                    {sortedItems
                        .filter(item => sliderValues[item.id] !== 0)
                        .map((item) => {
                            const sliderValue = sliderValues[item.id] || 0;
                            return (
                                <div key={item.id}>
                                    <ClaimRow
                                        numPositionsFor={item.numPositionsFor}
                                        numPositionsAgainst={item.numPositionsAgainst}
                                        totalTVL={item.totalTVL}
                                        tvlFor={item.tvlFor}
                                        tvlAgainst={item.tvlAgainst}
                                        currency={item.currency}
                                        userPosition={item.userPosition}
                                        positionDirection={item.positionDirection}
                                        onStakeForClick={() => console.log('Vote FOR project', item.subject)}
                                        onStakeAgainstClick={() => console.log('Vote AGAINST project', item.subject)}
                                    >
                                        <div className="flex flex-col w-full gap-4">
                                            <Claim
                                                subject={{ variant: 'non-user', label: item.subject }}
                                                predicate={{ variant: 'non-user', label: item.predicate }}
                                                object={{ variant: 'non-user', label: item.object }}
                                            />
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <MultiSlider
                                                        sliders={[{
                                                            id: item.id,
                                                            value: sliderValue,
                                                            onChange: (value: number) => handleSliderChange(item.id, value)
                                                        }]}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </ClaimRow>
                                </div>
                            );
                    })}
                </div>
                
                {/* Sliders avec des valeurs nulles */}
                <div className="space-y-4">
                    {sortedItems
                        .filter(item => sliderValues[item.id] === 0)
                        .map((item) => {
                            const sliderValue = sliderValues[item.id] || 0;
                            return (
                                <div key={item.id}>
                                    <ClaimRow
                                        numPositionsFor={item.numPositionsFor}
                                        numPositionsAgainst={item.numPositionsAgainst}
                                        totalTVL={item.totalTVL}
                                        tvlFor={item.tvlFor}
                                        tvlAgainst={item.tvlAgainst}
                                        currency={item.currency}
                                        userPosition={item.userPosition}
                                        positionDirection={item.positionDirection}
                                        onStakeForClick={() => console.log('Vote FOR project', item.subject)}
                                        onStakeAgainstClick={() => console.log('Vote AGAINST project', item.subject)}
                                    >
                                        <div className="flex flex-col w-full gap-4">
                                            <Claim
                                                subject={{ variant: 'non-user', label: item.subject }}
                                                predicate={{ variant: 'non-user', label: item.predicate }}
                                                object={{ variant: 'non-user', label: item.object }}
                                            />
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <MultiSlider
                                                        sliders={[{
                                                            id: item.id,
                                                            value: sliderValue,
                                                            onChange: (value: number) => handleSliderChange(item.id, value)
                                                        }]}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </ClaimRow>
                                </div>
                            );
                    })}
                </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-center mt-8 mb-4">
                <Button
                    variant="primary"
                    size="lg"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    className="w-64"
                >
                    {canSubmit ? 'Submit Vote' : `${totalAbsoluteValue}% of 100% Allocated`}
                </Button>
            </div>

            <Pagination className="flex w-[800px] justify-between">
                <PaginationSummary totalEntries={data.length} label="claims" />
                <div className="flex">
                    <PaginationRowSelection
                        defaultValue={rowsPerPage.toString()}
                        onValueChange={(value) => setRowsPerPage(Number(value))}
                    />
                    <PaginationPageCounter currentPage={currentPage} totalPages={totalPages} />
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationFirst
                                href="#"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLast
                                href="#"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </div>
            </Pagination>
        </div>
    );
};

export default VotingPage; 
