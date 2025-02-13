import { useContractRead } from 'wagmi'
import { MULTIVAULT_CONTRACT_ADDRESS } from 'app/consts'
import { multivaultAbi } from 'app/lib/abis/multivault'
import { THING_VAULT_ID_TESTNET } from 'app/consts/general'
import { hexToString } from 'viem'

export const HackathonInfos = () => {
  const { data: atomData, isLoading } = useContractRead({
    address: MULTIVAULT_CONTRACT_ADDRESS as `0x${string}`,
    abi: multivaultAbi,
    functionName: 'atoms',
    args: [BigInt(THING_VAULT_ID_TESTNET)]
  })

  // Fonction utilitaire pour extraire les données de l'atom
  const extractAtomData = (hexData: `0x${string}` | undefined) => {
    if (!hexData) return { name: '', description: '', image: '' }
    
    try {
      const decodedString = hexToString(hexData)
      console.log('Decoded atom data:', decodedString)
      
      // Si la chaîne décodée est une URL, on retourne des valeurs par défaut
      if (decodedString.startsWith('http')) {
        return {
          name: 'MetaMask',
          description: 'A free, digital cryptocurrency wallet that allows users to store and manage their cryptocurrencies, interact with decentralized applications (dApps), and execute transactions on blockchain networks.',
          image: 'https://res.cloudinary.com/dfpwy9nyv/image/upload/v1724108358/remix/imycjbqghqweopkyrk0n.png'
        }
      }
      
      // Sinon on essaie de parser le JSON
      try {
        const parsedData = JSON.parse(decodedString)
        return {
          name: parsedData.name || 'No name found',
          description: parsedData.description || 'No description found',
          image: parsedData.image || ''
        }
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError)
        return {
          name: decodedString,
          description: 'No description available',
          image: ''
        }
      }
    } catch (error) {
      console.error('Error decoding atom data:', error)
      return {
        name: 'Error decoding data',
        description: 'Error decoding data',
        image: ''
      }
    }
  }

  const atomInfo = extractAtomData(atomData as `0x${string}`)

  return (
    <div className="bg-gray-600 p-6 rounded-lg text-white max-w-4xl mx-auto">
      <h2 className="text-center text-lg font-bold">Basic hackathon information</h2>
      
      <div className="flex justify-center gap-2 my-2">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="bg-gray-400 text-sm px-3 py-1 rounded-full">Tag</span>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white text-black p-4 rounded">
          {isLoading ? 'Loading...' : atomInfo.name || 'No atom data'}
        </div>
        <div className="bg-white text-black p-4 rounded">
          {isLoading ? 'Loading...' : atomInfo.description || 'No description available'}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-white p-4 rounded">
          <h3 className="text-black mb-2">Price pool</h3>
          {[...Array(3)].map((_, i) => (
            <button key={i} className="bg-teal-500 text-white w-full py-2 my-1 rounded">1st price</button>
          ))}
        </div>
        
        <div className="bg-white p-4 rounded">
          <h3 className="text-black mb-2">Dates</h3>
          <button className="bg-teal-500 text-white w-full py-2 my-1 rounded">start date</button>
          <button className="bg-teal-500 text-white w-full py-2 my-1 rounded">end date</button>
        </div>
        
        <div className="bg-gray-300 flex items-center justify-center p-4 rounded">
          {atomInfo.image ? (
            <img 
              src={atomInfo.image} 
              alt={atomInfo.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="bg-gray-400 p-8 rounded">
              <span className="block text-gray-700">📷</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
