import { useEffect, useState } from 'react'

import { configureClient, SubAtomDocument } from '@0xintuition/graphql_bp'

import { createClient } from 'graphql-ws'

import buildproofLogo from '../../assets/svg/buildproof-logo.svg'
import { ipfsToHttpUrl } from 'app/utils/submit-hackathon/pinata'

configureClient({
  apiUrl: 'https://dev.base-sepolia.intuition-api.com/v1/graphql',
})

const wsClient = createClient({
  url: 'wss://dev.base-sepolia.intuition-api.com/v1/graphql',
})

interface HackathonInfosProps {
  atomId: number
}

export const HackathonInfos = ({ atomId }: HackathonInfosProps) => {
  const [ipfsData, setIpfsData] = useState<{
    name?: string
    description?: string
    image?: string
  }>()
  const [atomData, setAtomData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let unsubscribe: () => void

    try {
      unsubscribe = wsClient.subscribe(
        {
          query: SubAtomDocument,
          variables: { id: atomId },
        },
        {
          next: (data) => {
            setAtomData(data.data?.atom)
            setLoading(false)
          },
          error: (err) => {
            console.error('Subscription error:', err)
            setError(err instanceof Error ? err : new Error(String(err)))
            setLoading(false)
          },
          complete: () => {
            setLoading(false)
          },
        },
      )
    } catch (err) {
      console.error('Failed to create subscription:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [atomId])

  useEffect(() => {
    const fetchIpfsData = async () => {
      if (atomData?.data && atomData.data.startsWith('ipfs://')) {
        const ipfsHash = atomData.data.replace('ipfs://', '')
        const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`
        try {
          const response = await fetch(ipfsUrl)
          const data = await response.json()
          setIpfsData(data)
        } catch (err) {
          console.error('Error fetching IPFS data:', err)
        }
      }
    }

    fetchIpfsData()
  }, [atomData?.data])

  if (error) {
    console.error('Subscription error:', error)
    return <div>Error loading hackathon data</div>
  }

  return (
    <div className="bg-gray-600 p-6 rounded-lg text-white max-w-4xl mx-auto">
      <h2 className="text-center text-lg font-bold">
        Basic hackathon information
      </h2>

      <div className="flex justify-center gap-2 my-2">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="bg-gray-400 text-sm px-3 py-1 rounded-full">
            Tag
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white text-black p-4 rounded">
          {!atomData
            ? 'loading...'
            : ipfsData
              ? ipfsData.name || 'No name available'
              : 'Fetching name...'}
        </div>
        <div className="bg-white text-black p-4 rounded">
          {!atomData
            ? 'loading...'
            : ipfsData
              ? ipfsData.description || 'No description available'
              : 'Fetching description...'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-white p-4 rounded">
          <h3 className="text-black mb-2">Price pool</h3>
          <div className="flex justify-center items-center bg-teal-500 text-white w-full py-2 my-1 rounded">
            {(() => {
              const triple = atomData?.as_subject_triples?.find(
                (triple: any) => triple.predicate.label === 'total cash prize'
              );              
              return atomData
                ? triple?.object?.label || 'No prize data'
                : 'loading...';
            })()}
          </div>
        </div>

        <div className="bg-white p-4 rounded">
          <h3 className="text-black mb-2">Dates</h3>
          <div className="flex justify-center items-center bg-teal-500 text-white w-full py-2 my-1 rounded">
          {(() => {
              const triple = atomData?.as_subject_triples?.find(
                (triple: any) => triple.predicate.label === 'starts_on'
              );              
              return atomData
                ? triple?.object?.label || 'No prize data'
                : 'loading...';
            })()}
          </div>
          <div className="flex justify-center items-center bg-teal-500 text-white w-full py-2 my-1 rounded">
          {(() => {
              const triple = atomData?.as_subject_triples?.find(
                (triple: any) => triple.predicate.label === 'ends_on'
              );              
              return atomData
                ? triple?.object?.label || 'No prize data'
                : 'loading...';
            })()}
          </div>
        </div>

        <div className="bg-gray-300 flex items-center justify-center p-4 rounded">
          {(() => {    
            if (!atomData) {
              return (
                <div className="bg-gray-400 p-8 rounded">
                  <span className="block text-gray-700">⌛</span>
                </div>
              );
            }

            if (!ipfsData) {
              return (
                <div className="bg-gray-400 p-8 rounded">
                  <span className="block text-gray-700">Loading IPFS data...</span>
                </div>
              );
            }
            
            // Si l'image n'existe pas ou n'est pas une URL valide
            if (!ipfsData.image || ipfsData.image.startsWith('/')) {
              return (
                <img
                  src={buildproofLogo}
                  alt="BuildProof Logo"
                  className="w-full h-full object-cover rounded"
                />
              );
            }
            
            return (
              <img
                src={ipfsToHttpUrl(ipfsData.image)}
                alt={ipfsData.name || ''}
                className="w-full h-full object-cover rounded"
              />
            );
          })()}
        </div>
      </div>
    </div>
  )
}
