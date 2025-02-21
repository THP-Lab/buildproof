import { useState, useEffect } from 'react';

interface Fund {
  ticker: string;
  amount: string;
}

interface Domain {
  domainId: number;
  domainName: string;
  funds: Fund[];
}

export function useDomainFunds() {
  const [domainFunds, setDomainFunds] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDomainFunds = async () => {
      try {
        const response = await fetch('http://217.154.8.211/api/domains');
        const data: Domain[] = await response.json();
        setDomainFunds(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch domain funds'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomainFunds();
  }, []);

  return { domainFunds, isLoading, error };
}
