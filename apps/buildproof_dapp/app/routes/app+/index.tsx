import { Home } from '../../components/home/home'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configureClient } from '@0xintuition/graphql'

// Configure the GraphQL client
configureClient({
  apiUrl: "https://dev.base-sepolia.intuition-api.com/v1/graphql",
})

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}

