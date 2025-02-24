export interface Fund {
  ticker: string;
  amount: string;
}

export interface Domain {
  domainId: number;
  domainName: string;
  funds: Fund[];
}

export interface UserDomain {
  domainId: number;
  domainName: string;
  roles: string;
  reputation: string;
}

export interface UserData {
  address: string;
  domains: UserDomain[];
}

export interface Prize {
  name: string;
  amount: number;
  percent?: number;
  otherName?: string;
}

export interface AtomIds {
  [key: string]: bigint;
}

export interface Triple {
  subject: string;
  predicate: string;
  object: string | number;
  displayValue?: string;
  subjectId?: bigint;
  predicateId?: bigint;
  objectId?: bigint;
}

export interface AtomResult {
  value: string;
  id: bigint | null;
}

export interface TripleToCreate {
  subjectId: bigint;
  predicateId: bigint;
  objectId: bigint;
}

export type TripleDisplay = Omit<Triple, 'subjectId' | 'predicateId' | 'objectId'>; 