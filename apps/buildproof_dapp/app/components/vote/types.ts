import { ClaimPosition } from '@0xintuition/buildproof_ui'

export type SupportedCurrency = 'ETH' | '$'

export interface VoteItem {
  id: string
  numPositionsFor: number
  numPositionsAgainst: number
  totalTVL: string
  tvlFor: string
  tvlAgainst: string
  currency: SupportedCurrency
  subject: string
  predicate: string
  object: string
  votesCount: number
  totalEth: number
  userPosition?: string
  positionDirection?: (typeof ClaimPosition)[keyof typeof ClaimPosition]
  vault?: {
    current_share_price: string
  }
  counter_vault?: {
    current_share_price: string
  }
}
