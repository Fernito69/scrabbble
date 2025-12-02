import { LetterLiteral, LetterValueMap } from "@/model/core.model";

export const computeTilePouch = (
  quantityMap: LetterValueMap
): LetterLiteral[] => {
  return Object.entries(quantityMap)
    .reduce(
      (acc, [letter, quantity]) => [...acc, ...Array(quantity).fill(letter)],
      [] as LetterLiteral[]
    )
    .sort(() => Math.random() - 0.5);
};
