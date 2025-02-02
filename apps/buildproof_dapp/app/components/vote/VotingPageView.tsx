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
    PaginationEllipsis,
    PaginationLink,
    ClaimPosition,
    MultiSlider,
    Button,
} from '@0xintuition/buildproof_ui';
import type { VoteItem, SupportedCurrency } from './types';
import { formatUnits } from 'viem';

import { CurrencyToggle } from './CurrencyToggle';

const formatTVL = (value: string, currency: SupportedCurrency) => {
    const num = Number(formatUnits(BigInt(value), 18));
    if (isNaN(num) || num === 0) return '0';
    
    if (currency === 'ETH') {
        if (num > 0 && num < 0.0001) return '<0.0001';
        return num.toFixed(4);
    } else {
        if (num > 0 && num < 0.01) return '<0.01';
        return num.toFixed(2);
    }
};

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
    handleSliderCommit: (id: string, value: number) => void;
    canSubmit: boolean;
    handleSubmit: () => void;
    currentPage: number;
    totalPages: number;
    rowsPerPage: string;
    setRowsPerPage: (value: string) => void;
    setCurrentPage: (page: number) => void;
    data: VoteItem[];
    currency: SupportedCurrency;
    onCurrencyToggle: () => void;
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
    handleSliderCommit,
    canSubmit,
    handleSubmit,
    currentPage,
    totalPages,
    rowsPerPage,
    setRowsPerPage,
    setCurrentPage,
    data,
    currency,
    onCurrencyToggle
}: VotingPageViewProps) => {
    // Calculer les pages à afficher
    const getVisiblePages = (current: number, total: number) => {
        if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
        
        if (current === 1) {
            // Première page : afficher 1, 2, 3, ..., total
            return [1, 2, 3, null, total];
        }
        
        if (current === total) {
            // Dernière page : afficher 1, ..., total-2, total-1, total
            return [1, null, total - 2, total - 1, total];
        }
        
        if (current === 2) {
            // Deuxième page : afficher 1, 2, 3, ..., total
            return [1, 2, 3, null, total];
        }
        
        if (current === total - 1) {
            // Avant-dernière page : afficher 1, ..., total-2, total-1, total
            return [1, null, total - 2, total - 1, total];
        }
        
        // Pages du milieu : afficher 1, ..., current-1, current, current+1, ..., total
        return [1, null, current - 1, current, current + 1, null, total];
    };

    const visiblePages = getVisiblePages(currentPage, totalPages);

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
            
            <CurrencyToggle
                currency={currency}
                onToggle={onCurrencyToggle}
                ethAmount={ethAmount}
                setEthAmount={setEthAmount}
                totalAbsoluteValue={totalAbsoluteValue}
                resetAllSliders={resetAllSliders}
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
                                <div key={item.id} className="relative">
                                    {sliderValue !== 0 && (
                                        <button
                                            onClick={() => resetSingleSlider(item.id)}
                                            className="absolute right-2 top-2 p-1 rounded-full hover:bg-white/10 z-10"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                    <ClaimRow
                                        numPositionsFor={item.numPositionsFor}
                                        numPositionsAgainst={item.numPositionsAgainst}
                                        totalTVL={formatTVL(item.totalTVL, currency)}
                                        tvlFor={formatTVL(item.tvlFor, currency)}
                                        tvlAgainst={formatTVL(item.tvlAgainst, currency)}
                                        currency={currency}
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
                                                            onChange: (value: number) => handleSliderChange(item.id, value),
                                                            onChangeEnd: (value: number) => handleSliderCommit(item.id, value)
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
                                    <ClaimRow
                                        numPositionsFor={item.numPositionsFor}
                                        numPositionsAgainst={item.numPositionsAgainst}
                                        totalTVL={formatTVL(item.totalTVL, currency)}
                                        tvlFor={formatTVL(item.tvlFor, currency)}
                                        tvlAgainst={formatTVL(item.tvlAgainst, currency)}
                                        currency={currency}
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
                                                            onChange: (value: number) => handleSliderChange(item.id, value),
                                                            onChangeEnd: (value: number) => handleSliderCommit(item.id, value)
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
                            <PaginationPrevious
                                href="#"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            />
                        </PaginationItem>
                        {visiblePages.map((pageNum, idx) => (
                            <PaginationItem key={idx}>
                                {pageNum === null ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        isActive={pageNum === currentPage}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </div>
            </Pagination>
        </div>
    );
}; 