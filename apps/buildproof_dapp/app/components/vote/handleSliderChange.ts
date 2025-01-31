export const handleSliderChange = (
    itemId: string,
    newValue: number,
    sliderValues: { [key: string]: number },
    setSliderValues: (values: { [key: string]: number }) => void
) => {
    // Calculer la somme des valeurs absolues des autres sliders
    const otherValuesSum = Object.entries(sliderValues)
        .filter(([id]) => id !== itemId)
        .reduce((sum, [, value]) => sum + Math.abs(value), 0);

    // Vérifier si la nouvelle valeur ferait dépasser 100% au total
    if (Math.abs(newValue) + otherValuesSum > 100) {
        // Si on dépasse, on limite la valeur tout en gardant le signe
        const maxAllowedValue = 100 - otherValuesSum;
        const clampedValue = newValue > 0 ? maxAllowedValue : -maxAllowedValue;
        setSliderValues({
            ...sliderValues,
            [itemId]: clampedValue
        });
        alert('The total value cannot exceed 100% !');
    } else {
        setSliderValues({
            ...sliderValues,
            [itemId]: newValue
        });
    }
};

// Fonction pour réinitialiser un seul slider
export const resetSingleSlider = (
    itemId: string,
    sliderValues: { [key: string]: number },
    setSliderValues: (values: { [key: string]: number }) => void
) => {
    const newValues = { ...sliderValues };
    delete newValues[itemId];
    setSliderValues(newValues);
};

// Fonction pour réinitialiser tous les sliders
export const resetAllSliders = (
    setSliderValues: (values: { [key: string]: number }) => void
) => {
    setSliderValues({});
}; 