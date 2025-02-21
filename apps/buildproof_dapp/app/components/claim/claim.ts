import type { Prize } from '@components/submit-hackathon/prize-distribution';

// Un triple simple
interface Triple {
  subject: {
    label: string;
    id: string;
  };
  predicate: {
    label: string;
    id: string;
  };
  object: {
    label: string | number;
    id: string;
  };
}

// Un triple qui utilise un autre triple comme sujet ou objet
interface NestedTriple {
  subject: {
    subject: string;
    predicate: string;
    object: string | number;
    id: string;
  };
  predicate: {
    label: string;
    id: string;
  };
  object: {
    subject: string;
    predicate: string;
    object: string | number;
    id: string;
  } | {
    label: string | number;
    id: string;
  };
}

// Les triples pour un hackathon
export const hackathonTriples = (
  hackathonTitle: string,
  totalCashPrize: number,
  prizes: Prize[],
  startDate: string,
  endDate: string
): (Triple | NestedTriple)[] => [
  // Triple principal : hackathon -> prix total
  {
    subject: {
      label: hackathonTitle,
      id: ''
    },
    predicate: {
      label: 'Total Cash Prize',
      id: ''
    },
    object: {
      label: totalCashPrize,
      id: ''
    }
  },

  // Triples pour chaque prix
  ...prizes.map((prize) => ({
    subject: {
      label: prize.name,
      id: ''
    },
    predicate: {
      label: 'is',
      id: ''
    },
    object: {
      label: prize.amount,
      id: ''
    }
  })),

  // Triple pour la date de début (utilise le triple principal comme sujet)
  {
    subject: {
      subject: hackathonTitle,
      predicate: 'Total Cash Prize',
      object: totalCashPrize,
      id: ''
    },
    predicate: {
      label: 'starts_on',
      id: ''
    },
    object: {
      label: startDate,
      id: ''
    }
  } as NestedTriple,

  // Triple pour la date de fin (utilise le triple principal comme sujet)
  {
    subject: {
      subject: hackathonTitle,
      predicate: 'Total Cash Prize',
      object: totalCashPrize,
      id: ''
    },
    predicate: {
      label: 'ends_on',
      id: ''
    },
    object: {
      label: endDate,
      id: ''
    }
  } as NestedTriple,

  // Triples de composition (utilise le triple principal comme sujet et les triples de prix comme objets)
  ...prizes.map((prize) => ({
    subject: {
      subject: hackathonTitle,
      predicate: 'Total Cash Prize',
      object: totalCashPrize,
      id: ''
    },
    predicate: {
      label: 'is composed',
      id: ''
    },
    object: {
      subject: prize.name,
      predicate: 'is',
      object: prize.amount,
      id: ''
    }
  } as NestedTriple))
];