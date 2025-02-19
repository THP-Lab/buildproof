import { useGetAtomQuery, useGetAtomsQuery, configureClient } from '@0xintuition/graphql';
import { useState, useEffect } from 'react';

configureClient({
  apiUrl: "https://dev.base-sepolia.intuition-api.com/v1/graphql",
});

export const HackathonInfos = () => {
  const [ipfsData, setIpfsData] = useState<{ name?: string; description?: string }>();
  const { data: atomData, isLoading: loading, error } = useGetAtomQuery(
    { id: 13217 }
  );

  const { data: atomsData } = useGetAtomsQuery({
    limit: 5
  });

  useEffect(() => {
    const fetchIpfsData = async () => {
      if (atomData?.atom?.data && atomData.atom.data.startsWith('ipfs://')) {
        const ipfsHash = atomData.atom.data.replace('ipfs://', '');
        const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
        try {
          const response = await fetch(ipfsUrl);
          const data = await response.json();
          setIpfsData(data);
        } catch (err) {
          console.error('Error fetching IPFS data:', err);
        }
      }
    };

    fetchIpfsData();
  }, [atomData?.atom?.data]);

  console.log('Atom Data:', atomData);
  console.log('Atom Details:', atomData?.atom);
  console.log('Error:', error);
  console.log('Available Atoms:', atomsData);
  console.log('IPFS Data:', ipfsData);

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
          {loading ? 'Loading...' : ipfsData?.name || 'No name available'}
        </div>
        <div className="bg-white text-black p-4 rounded">
          {loading ? 'Loading...' : ipfsData?.description || 'No description available'}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-white p-4 rounded">
          <h3 className="text-black mb-2">Price pool</h3>
          {atomData?.atom?.as_subject_triples?.map((triple) => {
            if (triple.predicate.data === 'total cash prize') {
              return (
                <button key={triple.id} className="bg-teal-500 text-white w-full py-2 my-1 rounded">
                  {triple.object.data} USD
                </button>
              );
            }
            return null;
          })}
        </div>
        
        <div className="bg-white p-4 rounded">
          <h3 className="text-black mb-2">Dates</h3>
          <button className="bg-teal-500 text-white w-full py-2 my-1 rounded">start date</button>
          <button className="bg-teal-500 text-white w-full py-2 my-1 rounded">end date</button>
        </div>
        
        <div className="bg-gray-300 flex items-center justify-center p-4 rounded">
          {loading ? (
            <div className="bg-gray-400 p-8 rounded">
              <span className="block text-gray-700">⌛</span>
            </div>
          ) : atomData?.atom?.image && typeof atomData.atom.image === 'string' ? (
            <img 
              src={atomData.atom.image} 
              alt={ipfsData?.name || ''}
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
