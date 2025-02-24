import type { Prize } from '@routes/app+/submit-hackathon/utils/types'

export const isFormValid = (
  partnerName: string,
  hackathonTitle: string,
  description: string,
  startDate: string,
  endDate: string,
  totalCashPrize: number,
  totalPrizeAmount: number,
): boolean => {
  const isAllFieldsFilled =
    partnerName !== '' &&
    hackathonTitle !== '' &&
    description !== '' &&
    startDate !== '' &&
    endDate !== '' &&
    totalCashPrize > 0

  const isTotalCorrect = totalPrizeAmount === totalCashPrize

  return isAllFieldsFilled && isTotalCorrect
}

export const validateDates = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()

  return start > today && end > start
}

export const getAvailablePrizeOptions = (
  prizes: Prize[],
  prizeOptions: Array<{ value: string; label: string }>,
) => {
  const usedPrizes = prizes.map((prize) => prize.name)
  return prizeOptions.filter(
    (option) =>
      option.value.toLowerCase() === 'other' ||
      !usedPrizes.includes(option.value),
  )
}
