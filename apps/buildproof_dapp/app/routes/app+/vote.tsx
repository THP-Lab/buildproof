import { useState } from 'react';
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
    MultiSlider
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
            numPositionsAgainst: 7,
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
    ]);

    // Préparer les données pour le MultiSlider
    const sliders = data.map(item => ({
        id: item.id,
        projectName: item.subject,
        votesCount: item.votesCount,
        totalEth: item.totalEth,
        value: sliderValues[item.id] || 0,
        onChange: (value: number) => {
            setSliderValues(prev => ({
                ...prev,
                [item.id]: value
            }));
        }
    }));

    const currentItems = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const tabs = [
        { value: 'overview', label: 'Overview' },
        { value: 'voting', label: 'Voting' },
        { value: 'results', label: 'Results' },
    ];

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

            {/* MultiSlider pour le vote */}
            <div className="bg-card rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Vote Distribution</h2>
                <MultiSlider sliders={sliders} />
            </div>

            {/* Liste des Claims */}
            <div className="space-y-4">
                {currentItems.map((item, index) => (
                    <ClaimRow
                        key={startIndex + index}
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
                        <Claim
                            subject={{ variant: 'non-user', label: item.subject }}
                            predicate={{ variant: 'non-user', label: item.predicate }}
                            object={{ variant: 'non-user', label: item.object }}
                        />
                    </ClaimRow>
                ))}
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
