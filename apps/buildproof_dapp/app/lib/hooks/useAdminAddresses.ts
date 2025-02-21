import { useState, useEffect } from 'react';

interface Domain {
  domainId: number;
  domainName: string;
  roles: string;
  reputation: string;
}

interface UserData {
  address: string;
  domains: Domain[];
}

export function useAdminAddresses() {
  const [adminAddresses, setAdminAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAdminAddresses = async () => {
      try {
        const response = await fetch('http://217.154.8.211/api/users');
        const data: UserData[] = await response.json();
        
        const addresses = data
          .filter(user => 
            user.domains.some(domain => 
              domain.roles.split(', ').includes('Administration')
            )
          )
          .map(user => user.address.toLowerCase());
        
        setAdminAddresses(addresses);
      } catch (err) {
        console.error('Erreur lors de la récupération des adresses admin:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch admin addresses'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminAddresses();
  }, []);

  return { adminAddresses, isLoading, error };
}
