import { multivaultAbi } from '@lib/abis/multivault'
import { useBatchCreateTriple } from '@lib/hooks/useBatchCreateTriple'
import { MULTIVAULT_CONTRACT_ADDRESS } from 'app/consts'
import { VALUE_PER_TRIPLE } from 'app/utils/submit-hackathon/constants'
import type { Prize, TripleToCreate } from 'app/utils/submit-hackathon/types'
import { usePublicClient } from 'wagmi'

export const useTripleCreation = () => {
  const publicClient = usePublicClient()
  const { writeContractAsync: writeBatchCreateTriple } = useBatchCreateTriple()

  const checkTripleExists = async (
    subject: string | number | bigint,
    predicate: string | number | bigint,
    object: string | number | bigint,
  ): Promise<bigint | null> => {
    if (!publicClient) return null

    try {
      const exists = (await publicClient.readContract({
        address: MULTIVAULT_CONTRACT_ADDRESS,
        abi: multivaultAbi,
        functionName: 'isTriple',
        args: [
          BigInt(subject.toString()),
          BigInt(predicate.toString()),
          BigInt(object.toString()),
        ],
      })) as boolean

      return exists ? 1n : null
    } catch (error) {
      console.error('Error checking triple:', error)
      return null
    }
  }

  const createTriples = async (atomIds: { [key: string]: bigint }) => {
    // Vérifier que tous les IDs nécessaires sont présents
    const requiredKeys = [
      'hackathon',
      'starts_on',
      'starts_on_date',
      'ends_on',
      'ends_on_date',
      'total_cash_prize',
      'total_cash_prize_amount',
      'buildproof_test',
    ]

    for (const key of requiredKeys) {
      if (!atomIds[key]) {
        throw new Error(`Missing required ID for ${key}`)
      }
    }

    const triplesToCreate: TripleToCreate[] = [
      // Hackathon has tag BuildProof test
      {
        subjectId: atomIds['hackathon'],
        predicateId: 3n, // has_tag est toujours 3n
        objectId: atomIds['buildproof_test'],
      },
      // Hackathon starts_on date
      {
        subjectId: atomIds['hackathon'],
        predicateId: atomIds['starts_on'],
        objectId: atomIds['starts_on_date'],
      },
      // Hackathon ends_on date
      {
        subjectId: atomIds['hackathon'],
        predicateId: atomIds['ends_on'],
        objectId: atomIds['ends_on_date'],
      },
      // Hackathon total cash prize
      {
        subjectId: atomIds['hackathon'],
        predicateId: atomIds['total_cash_prize'],
        objectId: atomIds['total_cash_prize_amount'],
      },
    ]

    // Ajouter les triples pour chaque prix
    const prizeTypes = [
      'first_place',
      'second_place',
      'third_place',
      'other_place_a',
      'other_place_b',
    ]

    for (const prizeType of prizeTypes) {
      if (atomIds[prizeType] && atomIds[`${prizeType}_amount`]) {
        triplesToCreate.push({
          subjectId: atomIds['hackathon'],
          predicateId: atomIds[prizeType],
          objectId: atomIds[`${prizeType}_amount`],
        })
      }
    }

    console.log('Final triples to create:', triplesToCreate)

    return triplesToCreate
  }

  const batchCreateTriple = async (triples: TripleToCreate[]) => {
    const hash = await writeBatchCreateTriple({
      address: MULTIVAULT_CONTRACT_ADDRESS,
      abi: multivaultAbi,
      functionName: 'batchCreateTriple',
      args: [
        triples.map((t) => t.subjectId),
        triples.map((t) => t.predicateId),
        triples.map((t) => t.objectId),
      ],
      value: VALUE_PER_TRIPLE * BigInt(triples.length),
    })

    return hash
  }

  return {
    checkTripleExists,
    createTriples,
    writeBatchCreateTriple: batchCreateTriple,
  }
}
