import { useState } from 'react';
import { 
    ClaimRow, Claim, SegmentedControl, SegmentedControlItem, EmptyStateCard, Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationNext, 
    PaginationPrevious, 
    PaginationLink,
    PaginationSummary,
    PaginationRowSelection,
    PaginationPageCounter,
    PaginationFirst,
    PaginationLast
} from '../../../../../packages/buildproof_ui/src/components';
import { ClaimPosition } from '../../../../../packages/buildproof_ui/src/types';

const VotingPage = () => {
    const [selectedTab, setSelectedTab] = useState('voting');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Calculer les indices pour la pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const [data] = useState([
        {
            numPositionsFor: 69,
            numPositionsAgainst: 7,
            totalTVL: '420.69',
            tvlFor: '240.69',
            tvlAgainst: '180',
            currency: 'ETH',
            userPosition: '3.19',
            subject: '0xTeam-A',
            predicate: 'participates',
            object: 'Hackathon',
        },
        {
            numPositionsFor: 50,
            numPositionsAgainst: 50,
            totalTVL: '300.00',
            tvlFor: '150.00',
            tvlAgainst: '150.00',
            currency: 'ETH',
            userPosition: '2.00',
            subject: '0xTeam-B',
            predicate: 'participates',
            object: 'Hackathon',
        },
        {
            numPositionsFor: 80,
            numPositionsAgainst: 120,
            totalTVL: '500.00',
            tvlFor: '400.00',
            tvlAgainst: '100.00',
            currency: 'ETH',
            userPosition: '1.50',
            subject: '0xTeam-C',
            predicate: 'participates',
            object: 'Hackathon',
        },{
            numPositionsFor: 69,
            numPositionsAgainst: 7,
            totalTVL: '420.69',
            tvlFor: '240.69',
            tvlAgainst: '180',
            currency: 'ETH',
            userPosition: '3.19',
            subject: '0xTeam-A',
            predicate: 'participates',
            object: 'Hackathon',
        },
        {
            numPositionsFor: 50,
            numPositionsAgainst: 50,
            totalTVL: '300.00',
            tvlFor: '150.00',
            tvlAgainst: '150.00',
            currency: 'ETH',
            userPosition: '2.00',
            subject: '0xTeam-B',
            predicate: 'participates',
            object: 'Hackathon',
        },
        {
            numPositionsFor: 80,
            numPositionsAgainst: 120,
            totalTVL: '500.00',
            tvlFor: '400.00',
            tvlAgainst: '100.00',
            currency: 'ETH',
            userPosition: '1.50',
            subject: '0xTeam-C',
            predicate: 'participates',
            object: 'Hackathon',
        },{
            numPositionsFor: 69,
            numPositionsAgainst: 7,
            totalTVL: '420.69',
            tvlFor: '240.69',
            tvlAgainst: '180',
            currency: 'ETH',
            userPosition: '3.19',
            subject: '0xTeam-A',
            predicate: 'participates',
            object: 'Hackathon',
        },
        {
            numPositionsFor: 50,
            numPositionsAgainst: 50,
            totalTVL: '300.00',
            tvlFor: '150.00',
            tvlAgainst: '150.00',
            currency: 'ETH',
            userPosition: '2.00',
            subject: '0xTeam-B',
            predicate: 'participates',
            object: 'Hackathon',
        },
        {
            numPositionsFor: 80,
            numPositionsAgainst: 120,
            totalTVL: '500.00',
            tvlFor: '400.00',
            tvlAgainst: '100.00',
            currency: 'ETH',
            userPosition: '1.50',
            subject: '0xTeam-C',
            predicate: 'participates',
            object: 'Hackathon',
        },{
            numPositionsFor: 69,
            numPositionsAgainst: 7,
            totalTVL: '420.69',
            tvlFor: '240.69',
            tvlAgainst: '180',
            currency: 'ETH',
            userPosition: '3.19',
            subject: '0xTeam-A',
            predicate: 'participates',
            object: 'Hackathon',
        },
        {
            numPositionsFor: 50,
            numPositionsAgainst: 50,
            totalTVL: '300.00',
            tvlFor: '150.00',
            tvlAgainst: '150.00',
            currency: 'ETH',
            userPosition: '2.00',
            subject: '0xTeam-B',
            predicate: 'participates',
            object: 'Hackathon',
        },
        {
            numPositionsFor: 80,
            numPositionsAgainst: 120,
            totalTVL: '500.00',
            tvlFor: '400.00',
            tvlAgainst: '100.00',
            currency: 'ETH',
            userPosition: '1.50',
            subject: '0xTeam-C',
            predicate: 'participates',
            object: 'Hackathon',
        },
    ]);

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
                message="Stake ETH to support or oppose projects participating in the hackathon. Your stake represents your conviction in the project's participation."
                className="mb-6"
            />

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
                        positionDirection={item.numPositionsFor > item.numPositionsAgainst ? ClaimPosition.claimFor : ClaimPosition.claimAgainst}
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
