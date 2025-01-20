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
import { useQuery } from '@tanstack/react-query';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireUser } from '@server/auth';
import { useGetTriplesWithPositionsQuery } from '@0xintuition/graphql';

// Constants
const TAG_PREDICATE_ID = 4; // for dev environment
const DEFAULT_PAGE_SIZE = 50;
const DEADHEAD_LABEL = "Deadhead";
const TOP_WEB3_TOOLING_LABEL = "Top Web3 Developer Tooling";

interface VoteItem {
    id: string;
    numPositionsFor: number;
    numPositionsAgainst: number;
    totalTVL: string;
    tvlFor: string;
    tvlAgainst: string;
    currency: string;
    subject: string;
    predicate: string;
    object: string;
    votesCount: number;
    totalEth: number;
    userPosition?: string;
    positionDirection?: "for" | "against";
}

interface Triple {
    id: string;
    vault_id: string;
    counter_vault_id: string;
    subject: {
        id: string;
        vault_id: string;
        label: string | null;
        image: string | null;
    };
    predicate: {
        id: string;
        vault_id: string;
        label: string | null;
        image: string | null;
    };
    object: {
        id: string;
        vault_id: string;
        label: string | null;
        image: string | null;
    };
    vault: {
        total_shares: string;
        position_count: number;
        positions: Array<{
            account: {
                id: string;
                label: string | null;
                image: string | null;
            };
            shares: string;
        }>;
    } | null;
    counter_vault: {
        total_shares: string;
        position_count: number;
        positions: Array<{
            account: {
                id: string;
                label: string | null;
                image: string | null;
            };
            shares: string;
        }>;
    } | null;
}

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        // Ensure user is authenticated
        const user = await requireUser(request);
        console.log('User authenticated:', user.wallet?.address);

        return json({
            userAddress: user.wallet?.address,
            predicateId: TAG_PREDICATE_ID
        });
    } catch (error) {
        console.error('Error in vote loader:', error);
        throw error;
    }
}

const VotingPage = () => {
    const { userAddress, predicateId } = useLoaderData<typeof loader>();
    const [selectedTab, setSelectedTab] = useState('voting');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sliderValues, setSliderValues] = useState<{ [key: string]: number }>({});

    // Fetch triples data using GraphQL
    const {
        data: triplesData,
        isLoading,
        error
    } = useGetTriplesWithPositionsQuery(
        {
            limit: DEFAULT_PAGE_SIZE,
            where: {
                _and: [
                    { predicate_id: { _eq: predicateId } },
                    { object: { label: { _eq: TOP_WEB3_TOOLING_LABEL } } }
                ]
            },
            address: userAddress!
        },
        {
            queryKey: ['get-triples-with-positions', predicateId, TOP_WEB3_TOOLING_LABEL, userAddress],
            enabled: !!userAddress && !!predicateId
        }
    );

    console.log('Query parameters:', {
        predicateId,
        objectLabel: TOP_WEB3_TOOLING_LABEL,
        userAddress,
        limit: DEFAULT_PAGE_SIZE
    });

    console.log('Query where clause:', {
        _and: [
            { predicate_id: { _eq: predicateId } },
            { object: { label: { _eq: TOP_WEB3_TOOLING_LABEL } } }
        ]
    });

    console.log('Triples data received:', triplesData);
    console.log('Triples array:', triplesData?.triples);
    if (triplesData?.triples) {
        console.log('Found claims:', triplesData.triples.map(t => ({
            id: t.id,
            subject: { id: t.subject.id, label: t.subject.label },
            object: { id: t.object.id, label: t.object.label },
            vault_id: t.vault_id,
            voteCount: t.vault?.position_count || 0,
            totalShares: t.vault?.total_shares || '0'
        })));
    }

    // Loading state
    if (isLoading) {
        return <div className="p-4">Loading triples data...</div>;
    }

    // Error state
    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading triples: {(error as Error).message}
            </div>
        );
    }

    // Transform the data into the format we need
    const data: VoteItem[] = triplesData?.triples?.map((triple: any) => {
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
            positionDirection: userVaultPosition ? "for" :
                userCounterVaultPosition ? "against" :
                    undefined
        };
    }) || [];

    // Calculate pagination indices
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentItems = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    // Prepare slider data
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

    const tabs = [
        { value: 'overview', label: 'Overview' },
        { value: 'voting', label: 'Voting' },
        { value: 'results', label: 'Results' },
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
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

            <EmptyStateCard
                title="How to Vote"
                message="Use the sliders to allocate your voting power. Positive values support a project, negative values oppose it. The total absolute values cannot exceed 100%."
                className="mb-6"
            />

            <div className="bg-card rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Vote Distribution</h2>
                <MultiSlider sliders={sliders} />
            </div>

            <div className="space-y-4">
                {currentItems.map((item) => (
                    <ClaimRow
                        key={item.id}
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
