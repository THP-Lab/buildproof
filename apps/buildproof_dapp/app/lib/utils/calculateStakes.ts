interface Triple {
  id: string
  vault_id: string
  counter_vault_id: string
  percentage: number
  initialPosition?: {
    vault: bigint
    counterVault: bigint
  }
  currentPosition?: {
    vault: bigint
    counterVault: bigint
  }
}

interface StakeCalculation {
  ids: any[]
  values: bigint[]
}

export function calculateStakes(
  triples: Triple[],
  amountToAddWei: bigint
): StakeCalculation {
  const stakes: StakeCalculation = { ids: [], values: [] }

  // Filtrer les triples avec un pourcentage non nul
  const activeTriples = triples.filter(triple => triple.percentage !== 0);

  activeTriples.forEach(triple => {
    // Calculer le nouveau montant basé sur le pourcentage de l'ajout
    const absolutePercentage = Math.abs(triple.percentage);
    const amountToAdd = (amountToAddWei * BigInt(absolutePercentage)) / 100n;
    
    if (amountToAdd > 0n) {
      const id = triple.percentage > 0 ? triple.vault_id : triple.counter_vault_id;
      stakes.ids.push(BigInt(id));
      stakes.values.push(amountToAdd);
    }
  });

  return stakes;
}
