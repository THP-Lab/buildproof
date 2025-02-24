import { multivaultAbi } from '@lib/abis/multivault'
import { useBatchCreateAtom } from '@lib/hooks/useBatchCreateAtom'
import { MULTIVAULT_CONTRACT_ADDRESS } from 'app/consts'
import { VALUE_PER_ATOM } from '@routes/app+/submit-hackathon/utils/constants'
import { keccak256, toHex } from 'viem'
import { useAccount, usePublicClient } from 'wagmi'

export type IpfsAtom = {
  '@context': string
  '@type': string
  name: string
  description?: string
  image?: string
}

export type AtomInfo = {
  ipfsHash: string
  id: bigint | null
}

export type AtomMapping = {
  [key: string]: AtomInfo
}

export const useAtomCreation = () => {
  const publicClient = usePublicClient()
  const { address } = useAccount()
  const { writeContractAsync: writeBatchCreateAtom } = useBatchCreateAtom()

  const getAtomId = async (value: string): Promise<bigint> => {
    if (!publicClient) throw new Error('No public client available')
    const atomHash = keccak256(toHex(value))
    const atomId = await publicClient.readContract({
      address: MULTIVAULT_CONTRACT_ADDRESS,
      abi: multivaultAbi,
      functionName: 'atomsByHash',
      args: [atomHash],
    })
    return BigInt(atomId as number)
  }

  const mapAtomToRole = async (
    atomMapping: AtomMapping,
    ipfsHash: string,
    role: string,
  ) => {
    const id = await getAtomId(ipfsHash)
    atomMapping[role] = {
      ipfsHash,
      id: id !== 0n ? id : null,
    }
  }

  const createAtomMapping = async (
    atomsWithRoles: Array<{ ipfsHash: string; role: string }>,
  ): Promise<AtomMapping> => {
    const atomMapping: AtomMapping = {}

    // Vérifier les IDs existants pour chaque hash IPFS
    for (const { ipfsHash, role } of atomsWithRoles) {
      await mapAtomToRole(atomMapping, ipfsHash, role)
    }

    return atomMapping
  }

  const ensureAtomsExist = async (
    atomMapping: AtomMapping,
  ): Promise<AtomMapping> => {
    if (!address) throw new Error('No address available')
    if (!publicClient) throw new Error('No public client available')

    // Identifier les atomes à créer
    const atomsToCreate = Object.entries(atomMapping)
      .filter(([_, info]) => !info.id)
      .map(([_, info]) => info.ipfsHash)

    // Créer les atomes manquants
    if (atomsToCreate.length > 0) {
      try {
        console.log('Creating atoms:', atomsToCreate)
        const hash = await writeBatchCreateAtom({
          address: MULTIVAULT_CONTRACT_ADDRESS,
          abi: multivaultAbi,
          functionName: 'batchCreateAtom',
          args: [atomsToCreate.map((hash) => toHex(hash))],
          value: VALUE_PER_ATOM * BigInt(atomsToCreate.length),
        })

        await publicClient.waitForTransactionReceipt({ hash })

        // Mettre à jour les IDs
        for (const [role, info] of Object.entries(atomMapping)) {
          if (!info.id) {
            const newId = await getAtomId(info.ipfsHash)
            atomMapping[role].id = newId
          }
        }
      } catch (error) {
        console.error('Error creating atoms:', error)
        throw error
      }
    }

    return atomMapping
  }

  return {
    createAtomMapping,
    ensureAtomsExist,
  }
}
