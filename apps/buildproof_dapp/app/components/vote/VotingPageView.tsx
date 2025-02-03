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
    cn
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
    sliderValues: Record<string, number>;
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
    setDebouncedSliderValues: React.Dispatch<React.SetStateAction<Record<string, number>>>;
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
    onCurrencyToggle,
    setDebouncedSliderValues
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
        <div className="flex-1">
            <div className="max-w-4xl mx-auto relative min-h-screen">
                {/* Fixed header */}
                <div className="sticky top-0 p-4 z-10">
                    <SegmentedControl>
                        {tabs.map((tab) => (
                            <SegmentedControlItem
                                key={tab.value}
                                isActive={selectedTab === tab.value}
                                onClick={() => setSelectedTab(tab.value)}
                            >
                                {tab.label}
                            </SegmentedControlItem>
                        ))}
                    </SegmentedControl>
                </div>

                {/* Main content */}
                <div className="p-4 space-y-6">
                    {/* Carte d'explication */}
                    <EmptyStateCard
                        title="How to Vote"
                        message="Use the sliders to allocate your voting power. Positive values support a project, negative values oppose it. The total absolute values cannot exceed 100%."
                        className="mb-6"
                    />
                    
                    {/* Currency Toggle et Reset */}
                    <CurrencyToggle
                        currency={currency}
                        onToggle={onCurrencyToggle}
                        ethAmount={ethAmount}
                        setEthAmount={setEthAmount}
                        totalAbsoluteValue={totalAbsoluteValue}
                        resetAllSliders={resetAllSliders}
                    />

                    {/* Liste des Claims */}
                    <div className="space-y-4">
                        {sortedItems.map((item) => (
                            <div key={item.id} className="relative">
                                <ClaimRow
                                    numPositionsFor={item.numPositionsFor}
                                    numPositionsAgainst={item.numPositionsAgainst}
                                    totalTVL={formatTVL(item.totalTVL, currency)}
                                    tvlFor={formatTVL(item.tvlFor, currency)}
                                    tvlAgainst={formatTVL(item.tvlAgainst, currency)}
                                    currency={currency}
                                    userPosition={item.userPosition ? formatTVL(item.userPosition, currency) : undefined}
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
                                                        value: sliderValues[item.id] ?? 0,
                                                        onChange: (value: number) => handleSliderChange(item.id, value),
                                                        onChangeEnd: (value: number) => handleSliderCommit(item.id, value)
                                                    }]}
                                                />
                                                {sliderValues[item.id] && (
                                                    <div className="text-sm text-white/60 mt-1 ml-2">
                                                        You are about to stake : {currency === 'ETH' ? 
                                                            `${((Math.abs(sliderValues[item.id]) / 100) * Number(ethAmount)).toFixed(5)} ETH` :
                                                            `$${((Math.abs(sliderValues[item.id]) / 100) * Number(ethAmount)).toFixed(2)}`
                                                            }
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </ClaimRow>
                                {(sliderValues[item.id] || 0) !== 0 && (
                                    <button
                                        onClick={() => resetSingleSlider(item.id)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-300"
                                        aria-label="Reset slider"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Spacer pour la barre fixe du bas */}
                    <div className="h-32" aria-hidden="true"></div>
                </div>

                {/* Fixed container at bottom */}
                <div className="sticky bottom-0 p-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-center mb-4">
                            <Button
                                variant="primary"
                                size="lg"
                                disabled={!canSubmit}
                                onClick={handleSubmit}
                                className="w-64 rounded-full bg-[#1A1A1A] text-gray-400"
                            >
                                {canSubmit ? 'Submit Vote' : `${totalAbsoluteValue}% of 100% Allocated`}
                            </Button>
                        </div>

                        <div className="flex justify-between items-center text-gray-400 text-sm">
                            <div>{data.length} claims found</div>
                            <div className="flex items-center">
                                <span className="mr-4">Rows per page</span>
                                <select 
                                    value={rowsPerPage} 
                                    onChange={(e) => setRowsPerPage(e.target.value)}
                                    className="bg-transparent border border-gray-700 rounded px-2 mr-4"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                                <span className="mr-4">Page {currentPage} of {totalPages}</span>
                                <div className="flex">
                                    <PaginationPrevious
                                        href="#"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    />
                                    {visiblePages.map((pageNum, idx) => (
                                        pageNum === null ? (
                                            <PaginationEllipsis key={idx} />
                                        ) : (
                                            <PaginationLink
                                                key={idx}
                                                href="#"
                                                isActive={pageNum === currentPage}
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        )
                                    ))}
                                    <PaginationNext
                                        href="#"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 