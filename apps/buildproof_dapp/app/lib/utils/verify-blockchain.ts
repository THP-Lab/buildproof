import { multivaultAbi } from '@lib/abis/multivault'
import { publicClient } from '@server/viem'
import { MULTIVAULT_CONTRACT_ADDRESS } from 'app/consts'
import { type Abi, type MulticallResponse } from 'viem'
import { keccak256, toHex } from 'viem'

async function fetchIPFSContent(cid: string): Promise<string> {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
    const text = await response.text()
    return text
  } catch (error) {
    console.error('Error fetching IPFS content:', error)
    return ''
  }
}

async function processIPFSContent(content: string): Promise<{ decoded: string, raw: string | null }> {
  if (content.startsWith('Qm') || content.startsWith('ipfs://')) {
    const cid = content.startsWith('ipfs://') ? content.replace('ipfs://', '') : content
    const ipfsContent = await fetchIPFSContent(cid)
    if (ipfsContent) {
      try {
        if (ipfsContent.trim().startsWith('{')) {
          const jsonContent = JSON.parse(ipfsContent)
          return {
            decoded: jsonContent.name || ipfsContent,
            raw: content
          }
        }
        return {
          decoded: ipfsContent,
          raw: content
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e)
        return {
          decoded: ipfsContent,
          raw: content
        }
      }
    }
  }
  return {
    decoded: content,
    raw: null
  }
}

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

    const subject = Buffer.from(subjectData.slice(2), 'hex').toString()
    const predicate = Buffer.from(predicateData.slice(2), 'hex').toString()
    const object = Buffer.from(objectData.slice(2), 'hex').toString()

    // Process all IPFS contents in parallel
    const [processedSubject, processedPredicate, processedObject] = await Promise.all([
      processIPFSContent(subject),
      processIPFSContent(predicate),
      processIPFSContent(object),
    ])

    return {
      exists: true,
      id: tripleId.toString(),
      atoms: {
        subject: processedSubject.decoded,
        predicate: processedPredicate.decoded,
        object: processedObject.decoded,
        rawObject: processedObject.raw
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
  const atomId = await publicClient.readContract({
    ...multiVaultContract,
    functionName: 'atomsByHash',
    args: [atomHash],
  })

  if (BigInt(atomId as bigint) > 0n) {
    const atomData = await publicClient.readContract({
      ...multiVaultContract,
      functionName: 'atoms',
      args: [atomId as bigint],
    }) as `0x${string}`

    const content = Buffer.from(atomData.slice(2), 'hex').toString()
    
    return {
      exists: true,
      ipfsUrl: content.startsWith('ipfs://') ? content : null,
      content: await processIPFSContent(content)
    }
  }
  
  return {
    exists: false,
    ipfsUrl: null,
    content: null
  }
}