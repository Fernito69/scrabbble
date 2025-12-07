import { PLAYER_HAND_LENGTH } from "@/model/core.defaults";
import { LetterLiteral, LetterValueMap, PlayerHand } from "@/model/core.model";

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

export const drawCards = (
  tilePouch: LetterLiteral[],
  playerHand: PlayerHand = [null, null, null, null, null, null, null]
): { hand: PlayerHand; tilePouch: LetterLiteral[] } => {
  const newTilePouch = [...tilePouch];

  // Calculate how many cards to draw
  const handWithoutNulls = playerHand.filter(Boolean) as LetterLiteral[];
  const numCardsToDraw = PLAYER_HAND_LENGTH - handWithoutNulls.length;

  const newHand = [
    ...handWithoutNulls,
    ...newTilePouch.splice(0, numCardsToDraw),
  ] as PlayerHand;

  // If the pouch is empty, the new hand will be smaller than the player hand. Fill the rest with nulls
  if (newHand.length < PLAYER_HAND_LENGTH) {
    newHand.push(...Array(PLAYER_HAND_LENGTH - newHand.length).fill(null));
  }

  return { hand: newHand, tilePouch: newTilePouch };
};
