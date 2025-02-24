import { useLoaderData } from '@remix-run/react'
import { hashDataToIPFS } from 'app/utils/ipfs-utils'

import type { IpfsAtom } from './useAtomCreation'

const DEFAULT_IMAGE = '/buildproof-logo.svg'

export const useIPFSStorage = () => {
  const { env } = useLoaderData<{ env: { PINATA_JWT: string | null } }>()

  const storeHackathonData = async (
    hackathonDataOrTitle: IpfsAtom | string,
    description: string,
  ) => {
    if (!env.PINATA_JWT) {
      throw new Error('PINATA_JWT is not configured')
    }

    const hackathonData: IpfsAtom =
      typeof hackathonDataOrTitle === 'string'
        ? {
            '@context': 'https://schema.org/',
            '@type': 'Thing',
            name: hackathonDataOrTitle,
            description,
            image: DEFAULT_IMAGE,
          }
        : hackathonDataOrTitle

    const atomListData: IpfsAtom = {
      '@context': 'https://schema.org/',
      '@type': 'Thing',
      name: 'BuildProof test',
    }

    const { ipfsHash: hackathonHash } = await hashDataToIPFS(
      hackathonData,
      env.PINATA_JWT,
    )
    const { ipfsHash: atomListHash } = await hashDataToIPFS(
      atomListData,
      env.PINATA_JWT,
    )

    return {
      hackathonHash,
      atomListHash,
    }
  }

  return {
    storeHackathonData,
  }
}
