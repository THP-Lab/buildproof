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
    Button,
    Input
} from '@0xintuition/buildproof_ui';
import type { VoteItem } from './types';

interface VotingPageViewProps {
    selectedTab: string;
    setSelectedTab: (tab: string) => void;
    tabs: Array<{ value: string; label: string }>;
    ethAmount: string;
    setEthAmount: (value: string) => void;
    totalAbsoluteValue: number;
    resetAllSliders: () => void;
    sortedItems: VoteItem[];
    sliderValues: { [key: string]: number };
    resetSingleSlider: (id: string) => void;
    handleSliderChange: (id: string, value: number) => void;
    canSubmit: boolean;
    handleSubmit: () => void;
    currentPage: number;
    totalPages: number;
    rowsPerPage: string;
    setRowsPerPage: (value: string) => void;
    setCurrentPage: (page: number) => void;
    data: VoteItem[];
}

export const VotingPageView = ({
    selectedTab,
    setSelectedTab,
    tabs,
    ethAmount,
    setEthAmount,
    totalAbsoluteValue,
    resetAllSliders,
    sortedItems,
    sliderValues,
    resetSingleSlider,
    handleSliderChange,
    canSubmit,
    handleSubmit,
    currentPage,
    totalPages,
    rowsPerPage,
    setRowsPerPage,
    setCurrentPage,
    data
}: VotingPageViewProps) => {
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

            {/* Total stakes input */}
            <div className="flex items-center justify-between bg-black p-2">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-white">Your Total stakes <br/> for this hackathon</div>
                    <div className="w-[120px]">
                        <Input
                            type="number"
                            value={ethAmount}
                            onChange={(e) => setEthAmount(e.target.value)}
                            className="h-8 bg-transparent text-white border-white/20"
                            step="0.001"
                            />
                    </div>
                    <div className="text-sm text-white">ETH</div>
                </div>
                
                {/* Progress bar with reset button */}
                <div className="flex items-center gap-2">
                    <div className="text-sm text-white">Total Stakes placed:</div>
                    <div className="w-[300px] bg-white/10 h-2 rounded-sm overflow-hidden">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${totalAbsoluteValue}%` }}
                        />
                    </div>
                    <div className="text-sm text-white whitespace-nowrap">
                        {totalAbsoluteValue}/100%
                    </div>
                    <button
                        onClick={() => resetAllSliders()}
                        className="ml-2 p-1 rounded-full hover:bg-white/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Liste des Claims */}
            <div className="space-y-8">
                {/* Sliders avec des valeurs non nulles */}
                <div className="space-y-4">
                    {sortedItems
                        .filter(item => sliderValues[item.id] !== 0)
                        .map((item) => {
                            const sliderValue = sliderValues[item.id] || 0;
                            return (
                                <div key={item.id} className="relative">
                                    <button
                                        onClick={() => resetSingleSlider(item.id)}
                                        className="absolute right-2 top-2 p-1 rounded-full hover:bg-white/10 z-10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
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
                                <div key={item.id} className="relative">
                                    <button
                                        onClick={() => resetSingleSlider(item.id)}
                                        className="absolute right-2 top-2 p-1 rounded-full hover:bg-white/10 z-10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
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
                        defaultValue={rowsPerPage}
                        onValueChange={setRowsPerPage}
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