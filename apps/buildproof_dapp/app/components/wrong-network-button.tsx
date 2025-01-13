import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Text,
} from '@0xintuition/buildproof_ui'

import { getChainEnvConfig } from '@lib/utils/environment'
import { CURRENT_ENV } from 'app/consts'
import { useSwitchChain } from 'wagmi'

const WrongNetworkButton: React.FC = () => {
  const { switchChain } = useSwitchChain()

  const handleSwitch = () => {
    if (switchChain) {
      switchChain({ chainId: getChainEnvConfig(CURRENT_ENV).chainId })
    }
  }

  return (
    <Button
      variant="primary"
      type="button"
      onClick={(e) => {
        e.preventDefault
        handleSwitch()
      }}
      className="w-40 mx-auto"
      size="lg"
    >
      Wrong Network
    </Button>
  )
}

export default WrongNetworkButton
