import type { Triple } from './types';

export const formatTriplesForDisplay = (triples: Triple[]) => {
  return triples.map(triple => ({
    subject: triple.subject,
    predicate: triple.predicate,
    object: triple.displayValue || triple.object
  }));
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const getNextWeekDate = (date: Date): Date => {
  const nextWeek = new Date(date);
  nextWeek.setDate(date.getDate() + 7);
  return nextWeek;
};

export const getTomorrowDate = (date: Date): Date => {
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  return tomorrow;
}; 