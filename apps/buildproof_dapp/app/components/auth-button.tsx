import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  IconName,
} from '@0xintuition/buildproof_ui'

import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from '@remix-run/react'

export function AuthButton() {
  const { login, logout, authenticated, ready, user } = usePrivy()
  const navigate = useNavigate()

  if (!ready) return null

  if (!authenticated) {
    return (
      <Button
        onClick={login}
        variant="primary"
        size="md"
        className="rounded-full"
      >
        Connect Wallet
      </Button>
    )
  }

  const truncatedAddress = user?.wallet?.address
    ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
    : 'Connected'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="primary" size="md" className="rounded-full gap-2">
          <Icon name={IconName.wallet} className="h-4 w-4" />
          {truncatedAddress}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 mt-2 rounded-lg">
        <DropdownMenuItem
          onClick={() => navigate('/app/profile')}
          className="gap-2"
        >
          <Icon name={IconName.personCircle} className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} className="gap-2">
          <Icon name={IconName.arrowBoxLeft} className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
