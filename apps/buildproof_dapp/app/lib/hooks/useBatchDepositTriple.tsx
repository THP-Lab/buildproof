import { useWriteContract } from 'wagmi'

import { attestorAbi } from '../../abi/attestor-abi'

export function useBatchDepositTriple() {
  const {
    writeContract,
    writeContractAsync,
    data,
    error,
    isPending,
    isSuccess,
  } = useWriteContract()

  const batchDepositTriple = async (
    params: {
      receiver: `0x${string}`
      ids: any[] // Pour accepter les BigInt littéraux (ex: 47n)
      values: bigint[]
      attestorAddress: `0x${string}`
    },
    options?: { value?: bigint },
  ) => {
    const { receiver, ids, values, attestorAddress } = params

    return writeContractAsync({
      address: attestorAddress,
      abi: attestorAbi,
      functionName: 'batchDepositTriple',
      args: [receiver, ids, values],
      value: options?.value,
    })
  }

  return {
    batchDepositTriple,
    data,
    error,
    isPending,
    isSuccess,
  }
}
