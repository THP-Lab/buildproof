import { useCallback, useState } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'
import { type Address } from 'viem'
import { useAccount } from 'wagmi'

const ATTESTOR_ADDRESS = '0x64Abd54a86DfeB710eF2943d6304FC7B29f18e36'
const MULTIVAULT_ADDRESS = '0x1A6950807E33d5bC9975067e6D6b5Ea4cD661665'

// ABI du MultiVault pour les fonctions d'approbation
const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "approveSender",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "approvals",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export function useVerifyAttestor() {
  const [isCheckingApproval, setIsCheckingApproval] = useState(false)
  const [approvalError, setApprovalError] = useState<Error | null>(null)
  const { address: userAddress } = useAccount()

  const contractConfig = {
    address: MULTIVAULT_ADDRESS as Address,
    abi: ABI,
  }

  // Lire si l'attestor est approuvé par l'utilisateur
  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    ...contractConfig,
    functionName: 'approvals',
    args: userAddress ? [userAddress as Address, ATTESTOR_ADDRESS as Address] : undefined,
  })

  // Écrire pour approuver l'attestor
  const { writeContract: approveSender } = useWriteContract()

  const verifyAndApproveAttestor = useCallback(async () => {
    if (!userAddress) {
      throw new Error('No user address available')
    }

    setIsCheckingApproval(true)
    setApprovalError(null)

    try {
      console.log('Current approval status:', isApproved)
      
      // Si déjà approuvé, retourner true immédiatement
      if (isApproved) {
        console.log('Attestor already approved by user')
        return true
      }

      console.log('Requesting attestor approval...')
      // Sinon, demander l'approbation
      await approveSender({
        ...contractConfig,
        functionName: 'approveSender',
        args: [ATTESTOR_ADDRESS as Address],
      })

      // Rafraîchir l'état d'approbation
      await refetchApproval()

      return true
    } catch (error) {
      console.error('Error approving attestor:', error)
      setApprovalError(error instanceof Error ? error : new Error('Unknown error'))
      return false
    } finally {
      setIsCheckingApproval(false)
    }
  }, [isApproved, approveSender, refetchApproval, contractConfig, userAddress])

  return {
    isApproved,
    isCheckingApproval,
    approvalError,
    verifyAndApproveAttestor,
  }
} 