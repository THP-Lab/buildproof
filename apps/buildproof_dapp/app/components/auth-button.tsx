import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@0xintuition/buildproof_ui'

export function AuthButton() {
  const { login, logout, authenticated, ready } = usePrivy()

  if (!ready) return null

  return (
    <Button
      onClick={authenticated ? logout : login}
      variant="primary"
      size="md"
    >
      {authenticated ? 'Disconnect' : 'Connect Wallet'}
    </Button>
  )
} 