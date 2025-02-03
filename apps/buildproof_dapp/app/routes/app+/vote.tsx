import { VotingPage } from '../../components/vote/VotingPage';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireUser } from '@server/auth';
import { useGetTriplesWithPositionsQuery } from '@0xintuition/graphql';
import { configureClient } from '@0xintuition/graphql';

configureClient({
    apiUrl: "https://dev.base-sepolia.intuition-api.com/v1/graphql",
});

// Constants
const TAG_PREDICATE_ID = 3; // for dev environment
const DEFAULT_PAGE_SIZE = 50;
const TOP_WEB3_TOOLING_LABEL = "Top Web3 Developer Tooling";

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        // Ensure user is authenticated
        const user = await requireUser(request);
        console.log('User authenticated:', user.wallet?.address);

        return json({
            userAddress: user.wallet?.address,
            predicateId: TAG_PREDICATE_ID,
        });
    } catch (error) {
        console.error('Error in vote loader:', error);
        throw error;
    }
}

const VotePage = () => {
    const { userAddress, predicateId } = useLoaderData<typeof loader>();

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
            address: userAddress?.toLowerCase()
        },
        {
            queryKey: ['get-triples-with-positions', predicateId, TOP_WEB3_TOOLING_LABEL, userAddress],
            enabled: !!userAddress && !!predicateId
        }
    );

    console.log('Query variables:', {
        predicateId,
        address: userAddress,
        TOP_WEB3_TOOLING_LABEL
    });

    console.log('Response data:', triplesData);

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

    return <VotingPage triplesData={triplesData} userAddress={userAddress} />;
};

export default VotePage; 
