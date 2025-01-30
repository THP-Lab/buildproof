interface Triple {
  id: string
  vault_id: string
  counter_vault_id: string
  percentage: number
}

interface StakeCalculation {
  ids: any[]
  values: bigint[]
}

export function calculateStakes(
  triples: Triple[],
  totalStakeWei: bigint
): StakeCalculation {
  const stakes: StakeCalculation = { ids: [], values: [] }

  // Filter out triples with 0 percentage
  const activeTriples = triples.filter(triple => triple.percentage !== 0)

  activeTriples.forEach(triple => {
    // Convert percentage to absolute value for calculation
    const absolutePercentage = Math.abs(triple.percentage)
    // Calculate the stake amount for this triple
    const stakeAmount = (totalStakeWei * BigInt(absolutePercentage)) / 100n

    // Use vault_id for positive percentages, counter_vault_id for negative
    const id = triple.percentage > 0 ? triple.vault_id : triple.counter_vault_id
    stakes.ids.push(eval(id + 'n'))
    stakes.values.push(stakeAmount)
  })

  return stakes
} 
