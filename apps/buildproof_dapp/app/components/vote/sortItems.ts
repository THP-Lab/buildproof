import { VoteItem } from './types'

export const sortItems = (
  data: VoteItem[],
  sliderValues: { [key: string]: number },
) => {
  return [...data].sort((a, b) => {
    const valueA = sliderValues[a.id] || 0
    const valueB = sliderValues[b.id] || 0

    // If one is non-zero and the other is zero, non-zero goes first
    if (valueA !== 0 && valueB === 0) return -1
    if (valueA === 0 && valueB !== 0) return 1

    // If both are non-zero, sort by percentage
    if (valueA !== 0 && valueB !== 0) {
      // If one is positive and the other negative, positive goes first
      if (valueA > 0 && valueB < 0) return -1
      if (valueA < 0 && valueB > 0) return 1

      // If both are positive, sort by value (highest first)
      if (valueA > 0 && valueB > 0) {
        if (valueA !== valueB) {
          return valueB - valueA
        }
        // If percentages are equal, sort by TVL
        const tvlForA = Number(a.tvlFor)
        const tvlForB = Number(b.tvlFor)
        return tvlForB > tvlForA ? 1 : tvlForB < tvlForA ? -1 : 0
      }

      // If both are negative, sort by value (most negative last)
      if (valueA < 0 && valueB < 0) {
        if (valueA !== valueB) {
          return valueB - valueA // This will put more negative values at the bottom
        }
        // If percentages are equal, sort by TVL
        const tvlForA = Number(a.tvlFor)
        const tvlForB = Number(b.tvlFor)
        return tvlForB > tvlForA ? 1 : tvlForB < tvlForA ? -1 : 0
      }
    }

    // If both are zero, sort by tvlFor in descending order
    if (valueA === 0 && valueB === 0) {
      const tvlForA = Number(a.tvlFor)
      const tvlForB = Number(b.tvlFor)
      return tvlForB > tvlForA ? 1 : tvlForB < tvlForA ? -1 : 0
    }

    return 0
  })
}
