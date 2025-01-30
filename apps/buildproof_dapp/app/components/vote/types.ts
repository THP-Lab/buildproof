import { ClaimPosition, ClaimPositionType } from '@0xintuition/buildproof_ui';

export type SupportedCurrency = 'ETH' | 'USDC';

export interface VoteItem {
    id: string;
    numPositionsFor: number;
    numPositionsAgainst: number;
    totalTVL: string;
    tvlFor: string;
    tvlAgainst: string;
    currency: SupportedCurrency;
    userPosition?: string;
    positionDirection?: ClaimPositionType;
    subject: string;
    predicate: string;
    object: string;
    votesCount: number;
    totalEth: number;
} 