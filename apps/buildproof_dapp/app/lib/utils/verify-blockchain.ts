import { multivaultAbi } from '@lib/abis/multivault'
import { publicClient } from '@server/viem'
import { MULTIVAULT_CONTRACT_ADDRESS } from 'app/consts'
import { type Abi, type MulticallResponse } from 'viem'
import { keccak256, toHex } from 'viem'

export async function verifyAtom(value: string): Promise<boolean> {
  try {
    const atomHash = keccak256(toHex(value))
    const atomId = await publicClient.readContract({
      address: MULTIVAULT_CONTRACT_ADDRESS,
      abi: multivaultAbi,
      functionName: 'atomsByHash',
      args: [atomHash]
    })
    return BigInt(atomId as number) > 0n
  } catch (error) {
    return false
  }
}

export async function verifyTriple(
  subjectId: bigint,
  predicateId: bigint,
  objectId: bigint,
) {
  const multiVaultContract = {
    address: MULTIVAULT_CONTRACT_ADDRESS as `0x${string}`,
    abi: multivaultAbi as Abi,
  }

  // Get the triple hash first
  const tripleHash = await publicClient.readContract({
    ...multiVaultContract,
    functionName: 'tripleHashFromAtoms',
    args: [subjectId, predicateId, objectId],
  })

  const contractConfigs = [
    {
      ...multiVaultContract,
      functionName: 'triplesByHash',
      args: [tripleHash],
    },
  ] as const

  const resp: MulticallResponse[] = await publicClient.multicall({
    contracts: contractConfigs,
  })

  const tripleId = resp[0].result as bigint
  
  if (tripleId > 0n) {
    // Get the atom strings
    const [subjectData, predicateData, objectData] = await Promise.all([
      publicClient.readContract({
        ...multiVaultContract,
        functionName: 'atoms',
        args: [subjectId],
      }),
      publicClient.readContract({
        ...multiVaultContract,
        functionName: 'atoms',
        args: [predicateId],
      }),
      publicClient.readContract({
        ...multiVaultContract,
        functionName: 'atoms',
        args: [objectId],
      }),
    ]) as [`0x${string}`, `0x${string}`, `0x${string}`]

    const predicate = Buffer.from(predicateData.slice(2), 'hex').toString()
    const object = Buffer.from(objectData.slice(2), 'hex').toString()

    // Format date if predicate is starts_on or ends_on
    const formattedObject = (predicate === 'starts_on' || predicate === 'ends_on') 
      ? `${object} Mars 2024`
      : object

    return {
      exists: true,
      id: tripleId.toString(),
      atoms: {
        subject: Buffer.from(subjectData.slice(2), 'hex').toString(),
        predicate,
        object: formattedObject,
      }
    }
  }

  return {
    exists: false,
    id: '0'
  }
}

export async function verifyHackathon(hackathonTitle: string) {
  const multiVaultContract = {
    address: MULTIVAULT_CONTRACT_ADDRESS as `0x${string}`,
    abi: multivaultAbi as Abi,
  }

  const atomHash = keccak256(toHex(hackathonTitle))
  const contractConfigs = [
    {
      ...multiVaultContract,
      functionName: 'atomsByHash',
      args: [atomHash],
    },
  ] as const

  const resp: MulticallResponse[] = await publicClient.multicall({
    contracts: contractConfigs,
  })

  const atomId = resp[0].result as bigint
  
  return {
    exists: atomId > 0n
  }
}