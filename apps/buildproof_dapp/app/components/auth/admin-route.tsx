import { Text } from '@0xintuition/buildproof_ui'

import { Navigate } from '@remix-run/react'

import { useIsAdmin } from '../../lib/hooks/useIsAdmin'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, isLoading, error } = useIsAdmin()

  if (isLoading) {
    return (
      <div className="p-6">
        <Text>Vérification des permissions...</Text>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Text className="text-red-500">
          Erreur lors de la vérification des permissions: {error.message}
        </Text>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}
