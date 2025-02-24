import { useEffect, useState } from 'react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
} from '@0xintuition/buildproof_ui'

import { formatUnits, parseEther } from 'viem'

import { multivaultAbi } from '../../lib/abis/multivault'
import { useRedeemTriple } from '../../lib/hooks/useRedeemTriple'

interface RedeemStakeModalProps {
  isOpen: boolean
  onClose: () => void
  claimId: string
  maxStake: number
  contractAddress: string
  userAddress: string
  totalShares: string
}

export function RedeemStakeModal({
  isOpen,
  onClose,
  claimId,
  maxStake,
  contractAddress,
  userAddress,
  totalShares,
}: RedeemStakeModalProps) {
  const [displayAmount, setDisplayAmount] = useState(maxStake)

  const {
    writeContractAsync: redeemTriple,
    awaitingWalletConfirmation,
    awaitingOnChainConfirmation,
  } = useRedeemTriple(contractAddress)

  useEffect(() => {
    if (isOpen && !userAddress) {
      console.error('Modal opened without user address')
      onClose()
    }
    setDisplayAmount(maxStake)
  }, [isOpen, userAddress, onClose, maxStake])

  const handleRedeem = async () => {
    if (!userAddress || userAddress === 'undefined') {
      console.error('No valid user address provided')
      return
    }

    if (!totalShares) {
      console.error('Missing share information', { totalShares })
      return
    }

    try {
      const percentage = displayAmount / maxStake
      let sharesToRedeem: bigint

      if (percentage >= 1) {
        // Pour 100%, utiliser directement le nombre total de shares
        sharesToRedeem = BigInt(totalShares)
      } else {
        // Pour un pourcentage partiel, utiliser le même pourcentage sur les shares
        sharesToRedeem = BigInt(Math.floor(Number(totalShares) * percentage))
      }

      console.log('Redeeming shares:', {
        displayAmount,
        maxStake,
        percentage,
        sharesToRedeem: sharesToRedeem.toString(),
        totalShares,
      })

      const tx = await redeemTriple({
        address: `0x1A6950807E33d5bC9975067e6D6b5Ea4cD661665`,
        abi: multivaultAbi,
        functionName: 'redeemTriple',
        args: [sharesToRedeem, userAddress as `0x${string}`, claimId],
      })

      onClose()
    } catch (error) {
      console.error('Error redeeming stake:', error)
    }
  }

  const handlePercentageClick = (percentage: number) => {
    setDisplayAmount(maxStake * (percentage / 100))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= maxStake) {
      setDisplayAmount(value)
    }
  }

  const isPending = awaitingWalletConfirmation || awaitingOnChainConfirmation
  const isDisabled =
    !userAddress ||
    userAddress === 'undefined' ||
    isPending ||
    displayAmount <= 0 ||
    displayAmount > maxStake

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeem Stake</DialogTitle>
          <DialogDescription>
            Choose how much stake you want to redeem from this claim.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Amount to Redeem (ETH)
            </label>
            <Input
              type="number"
              value={displayAmount}
              onChange={handleInputChange}
              max={maxStake}
              min={0}
              step="0.000001"
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum available: {maxStake} ETH
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePercentageClick(25)}
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePercentageClick(50)}
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePercentageClick(75)}
              >
                75%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePercentageClick(100)}
              >
                Max
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleRedeem} disabled={isDisabled}>
              {isPending ? 'Redeeming...' : 'Redeem Stake'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
