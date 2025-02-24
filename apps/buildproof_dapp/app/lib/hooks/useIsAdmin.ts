import { usePrivy } from '@privy-io/react-auth'

import { useAdminAddresses } from './useAdminAddresses'

export function useIsAdmin() {
  const { user } = usePrivy()
  const { adminAddresses, isLoading, error } = useAdminAddresses()

  const isAdmin =
    !isLoading && !error && user?.wallet?.address
      ? adminAddresses.includes(user.wallet.address.toLowerCase())
      : false

  return {
    isAdmin,
    isLoading,
    error,
  }
}
