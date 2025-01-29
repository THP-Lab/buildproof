import { VoteItem } from './types';

export const sortItems = (data: VoteItem[], sliderValues: { [key: string]: number }) => {
    return [...data].sort((a, b) => {
        const valueA = sliderValues[a.id] || 0;
        const valueB = sliderValues[b.id] || 0;
        
        // Si l'un est zéro et l'autre non, le zéro va en dernier
        if (valueA === 0 && valueB !== 0) return 1;
        if (valueA !== 0 && valueB === 0) return -1;
        
        // Si l'un est positif et l'autre négatif, le positif va en premier
        if ((valueA > 0 && valueB < 0) || (valueA < 0 && valueB > 0)) {
            return valueB - valueA;
        }
        
        // Si les deux sont positifs, on trie par ordre décroissant
        if (valueA > 0 && valueB > 0) {
            return valueB - valueA;
        }
        
        // Si les deux sont négatifs, on trie par ordre croissant
        if (valueA < 0 && valueB < 0) {
            return valueB - valueA;
        }
        
        return 0;
    });
}; 