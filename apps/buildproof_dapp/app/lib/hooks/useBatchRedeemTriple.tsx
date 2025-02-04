import { useWriteContract } from 'wagmi'
import { attestorAbi } from '../../abi/attestor-abi'

export function useBatchRedeemTriple(contractAddress: string) {
  const { writeContract, writeContractAsync, data, error, isPending, isSuccess } = useWriteContract()

  const batchRedeemTriple = async (
    params: {
      values: bigint[]
      receiver: `0x${string}`
      ids: any[] // Pour accepter les BigInt littéraux (ex: 47n)
      attestorAddress: `0x${string}`
    },
    options?: { value?: bigint }
  ) => {
    const { receiver, ids, values, attestorAddress } = params

    return writeContractAsync({
      address: attestorAddress,
      abi: attestorAbi,
      functionName: 'batchRedeemTriple',
      args: [values, receiver, ids],
      value: options?.value
    })
  }

  return {
    batchRedeemTriple,
    data,
    error,
    isPending,
    isSuccess
  }
}
