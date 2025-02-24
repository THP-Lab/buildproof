export const VALUE_PER_ATOM = BigInt("1000000000000000"); // 0.001 ETH par atome
export const VALUE_PER_TRIPLE = BigInt("1000000000000000"); // 0.001 ETH par triple

export const PRIZE_OPTIONS = [
  { value: 'First Place', label: 'First Place' },
  { value: 'Second Place', label: 'Second Place' },
  { value: 'Third Place', label: 'Third Place' },
  { value: 'Other', label: 'Other' },
] as { value: string; label: string; }[];

export const PRIZE_ORDER = ['Second Place', 'Third Place', 'Other'] as const;

export const MAX_RETRY_COUNT = 3;
export const RETRY_DELAY = 2000; // 2 secondes

export const DEFAULT_IMAGE = "/buildproof-logo.svg"; 