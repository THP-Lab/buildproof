import axios from 'axios'

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT_KEY
const PINATA_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY

interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

export const uploadToPinata = async (file: File): Promise<string> => {
  if (!PINATA_JWT) {
    throw new Error(
      "VITE_PINATA_JWT_KEY n'est pas défini dans les variables d'environnement",
    )
  }

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post<PinataResponse>(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      },
    )

    return `ipfs://${response.data.IpfsHash}`
  } catch (error) {
    console.error('Erreur lors du téléversement vers Pinata:', error)
    throw new Error("Échec du téléversement de l'image vers IPFS")
  }
}

export const isIpfsUrl = (url: string): boolean => {
  return url.startsWith('ipfs://')
}

export const ipfsToHttpUrl = (ipfsUrl: string): string => {
  if (!isIpfsUrl(ipfsUrl)) return ipfsUrl
  const hash = ipfsUrl.replace('ipfs://', '')
  return `https://${PINATA_GATEWAY}/ipfs/${hash}`
}
