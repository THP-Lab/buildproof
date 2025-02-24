export const calculateStakeValue = (
  shares: string,
  current_share_price: string,
): string => {
  if (!shares || !current_share_price) return '0'

  try {
    // Convertir les valeurs en BigInt pour éviter les problèmes de précision
    const sharesValue = BigInt(shares)
    const current_share_priceValue = BigInt(current_share_price)

    // Calculer : (shares * sharePrice) / (10^18 * 10^18)
    // La division par 10^18 deux fois car :
    // 1. Une fois pour le decimalPrecision du sharePrice
    // 2. Une fois pour la conversion wei -> ETH
    const result =
      (sharesValue * current_share_priceValue) / BigInt(10) ** BigInt(18)

    // Convertir le résultat en string pour le formatage
    return result.toString()
  } catch (error) {
    console.warn('Error calculating stake value:', error)
    return '0'
  }
}
