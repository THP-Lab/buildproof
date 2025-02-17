import { Dispatch, SetStateAction } from 'react'

import { toast } from '@0xintuition/buildproof_ui'

export const handleSliderChange = (
  id: string,
  value: number,
  sliderValues: { [key: string]: number },
  setSliderValues: Dispatch<SetStateAction<{ [key: string]: number }>>,
) => {
  // Calculer la somme des valeurs absolues des autres sliders
  const otherValuesSum = Object.entries(sliderValues)
    .filter(
      ([currentId, currentValue]) => currentValue !== 0 && currentId !== id,
    )
    .reduce((sum, [, currentValue]) => sum + Math.abs(currentValue), 0)

  // Vérifier si la nouvelle valeur ferait dépasser 100% au total
  if (Math.abs(value) + otherValuesSum > 100) {
    // Si on dépasse, on limite la valeur tout en gardant le signe
    const maxAllowedValue = 100 - otherValuesSum
    const clampedValue = value > 0 ? maxAllowedValue : -maxAllowedValue
    setSliderValues((prev) => ({
      ...prev,
      [id]: clampedValue,
    }))
    console.log(toast.getToasts().length)
    if (!toast.getToasts().length)
      toast.success('All your votes have been placed !', { dismissible: true })
  } else {
    toast.dismiss()
    setSliderValues((prev) => ({
      ...prev,
      [id]: value,
    }))
  }
}

// Fonction pour réinitialiser un seul slider
export const resetSingleSlider = (
  id: string,
  setSliderValues: Dispatch<SetStateAction<{ [key: string]: number }>>,
) => {
  setSliderValues((prev) => {
    const newValues = { ...prev }
    delete newValues[id]
    return newValues
  })
}

// Fonction pour réinitialiser tous les sliders
export const resetAllSliders = (
  setSliderValues: Dispatch<SetStateAction<{ [key: string]: number }>>,
) => {
  setSliderValues({})
}
