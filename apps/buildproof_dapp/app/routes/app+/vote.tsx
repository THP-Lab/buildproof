import { VotingPage } from '../../components/vote/VotingPage';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireUser } from '@server/auth';
import { useGetTriplesWithPositionsQuery } from '@0xintuition/graphql_bp';
import { configureClient } from '@0xintuition/graphql_bp';
import { useState } from 'react';

configureClient({
    apiUrl: "https://dev.base-sepolia.intuition-api.com/v1/graphql",
});

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        // Ensure user is authenticated
        const user = await requireUser(request);
        console.log('User authenticated:', user.wallet?.address);

        return json({
            userAddress: user.wallet?.address,
        });
    } catch (error) {
        console.error('Error in vote loader:', error);
        throw error;
    }
}

const VotePage = () => {
    const { userAddress } = useLoaderData<typeof loader>();
    const [searchConditions, setSearchConditions] = useState<any[]>([]);
    const [currentSearch, setCurrentSearch] = useState<{
        subject: string | null;
        predicate: string | null;
        object: string | null;
    }>({
        subject: null,
        predicate: null,
        object: null,
    });

    // Fetch triples data using GraphQL
    const {
        data: triplesData,
        isLoading,
        error,
    } = useGetTriplesWithPositionsQuery(
        {
            where: {
                _and: searchConditions
            },
            address: userAddress?.toLowerCase(),
            orderBy: [
                {
                    vault: {
                        positions_aggregate: {
                            count: "desc_nulls_last"
                        }
                    }
                },
                {
                    counter_vault: {
                        positions_aggregate: {
                            count: "desc_nulls_last"
                        }
                    }
                },
                {
                    vault: {
                        total_shares: "desc_nulls_last"
                    }
                }
            ]
        },
        {
            queryKey: ['get-triples-with-positions', userAddress, searchConditions],
            enabled: !!userAddress
        }
    );

    const handleSearch = (search: {
        subject: string | null;
        predicate: string | null;
        object: string | null;
    }) => {
        console.log('Search values:', search); // Pour le debug
        const conditions = [];
        
        if (search.subject) {
            conditions.push({
                _and: [
                    { subject: { label: { _eq: search.subject } } },
                    
                ]
            });
        }
        if (search.predicate) {
            conditions.push({
                _and: [
                    { predicate: { label: { _eq: search.predicate } } },
                    { predicate: { label: { _neq: search.predicate + 's' } } }
                ]
            });
        }
        if (search.object) {
            conditions.push({
                _and: [
                    { object: { label: { _eq: search.object } } },
                    { object: { label: { _neq: search.object + 's' } } }
                ]
            });
        }

        console.log('Search conditions:', JSON.stringify(conditions, null, 2)); // Pour le debug
        setSearchConditions(conditions);
        setCurrentSearch(search);
    };

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

    return <VotingPage 
        triplesData={triplesData} 
        userAddress={userAddress}
        onSearch={handleSearch}
        currentSearch={currentSearch}
    />;
};

export default VotePage; 
