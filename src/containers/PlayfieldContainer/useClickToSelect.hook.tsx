import { useGameContext } from "@/contexts/GameState.context";
import {
  LetterLiteral,
  Move,
  PlayerHand as PlayerHandType,
} from "@/model/core.model";
import { getWildcardLetter } from "@/services/collections/game/game.utils";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface SelectedTile {
  letter?: LetterLiteral; // Optional - undefined means empty square/destination selected
  source: "hand" | "board";
  // For hand tiles
  index?: number;
  // For board tiles
  x?: number;
  y?: number;
}

export const useClickToSelect = () => {
  const {
    state,
    localPlayerHand,
    localProposedMove,
    setLocalPlayerHand,
    template,
    setLocalProposedMove,
    isMyTurn,
  } = useGameContext();

  const { t } = useTranslation();

  const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null);

  const handleTileClick = (tile: SelectedTile) => {
    if (!state) return;

    // If clicking the same tile, deselect it
    if (
      selectedTile &&
      selectedTile.letter && // Only if we had a tile selected (not an empty destination)
      selectedTile.source === tile.source &&
      ((tile.source === "hand" && selectedTile.index === tile.index) ||
        (tile.source === "board" &&
          selectedTile.x === tile.x &&
          selectedTile.y === tile.y))
    ) {
      setSelectedTile(null);
      return;
    }

    // If we have an empty destination selected, move this tile there
    if (selectedTile && !selectedTile.letter && tile.letter) {
      if (
        selectedTile.source === "board" &&
        selectedTile.x !== undefined &&
        selectedTile.y !== undefined
      ) {
        const { collapsedWildcard, hasError } = getWildcardLetter(
          tile.letter,
          template!,
          t("playfield.wildcardPrompt")
        );
        if (hasError) {
          toast.error(t("playfield.invalidWildcard"));
          return;
        }

        // Move tile to the selected empty board square
        if (tile.source === "hand" && tile.index !== undefined) {
          // Move from hand to selected board square
          const newHand = [...localPlayerHand];
          newHand[tile.index] = null;
          const newProposedMove = [
            ...localProposedMove,
            {
              x: selectedTile.x,
              y: selectedTile.y,
              letter: tile.letter,
              collapsedWildcard,
            } satisfies Move,
          ];

          setLocalPlayerHand(newHand as PlayerHandType);
          setLocalProposedMove(newProposedMove);
          setSelectedTile(null);
          return;
        } else if (
          tile.source === "board" &&
          tile.x !== undefined &&
          tile.y !== undefined
        ) {
          // Move from board to selected board square
          const newProposedMove = localProposedMove.filter(
            (m) => !(m.x === tile.x && m.y === tile.y)
          );
          newProposedMove.push({
            x: selectedTile.x,
            y: selectedTile.y,
            letter: tile.letter,
            collapsedWildcard,
          } satisfies Move);

          setLocalProposedMove(newProposedMove);
          setSelectedTile(null);
          return;
        }
      }
    }

    // If no tile is selected, select this one
    if (!selectedTile) {
      setSelectedTile(tile);
      return;
    }

    // If a tile is selected, perform the move/swap
    if (selectedTile.letter && tile.letter) {
      performMove(selectedTile, tile);
      setSelectedTile(null);
    }
  };

  const handleBoardSquareClick = (x: number, y: number) => {
    if (!state || !isMyTurn || state.currentVote) return;

    // If there's a tile already at this position, don't handle it here
    // (it should be handled by handleTileClick)
    if (state.board[y][x].tile) return;

    const proposedTileAtPosition = localProposedMove.find(
      (m) => m.x === x && m.y === y
    );
    if (proposedTileAtPosition) return; // Will be handled by handleTileClick

    // If no tile is selected, select this empty square as a destination
    if (!selectedTile) {
      setSelectedTile({
        source: "board",
        x,
        y,
        letter: undefined, // Empty destination
      });
      return;
    }

    // If clicking the same empty square, deselect it
    if (
      !selectedTile.letter &&
      selectedTile.source === "board" &&
      selectedTile.x === x &&
      selectedTile.y === y
    ) {
      setSelectedTile(null);
      return;
    }

    // If we have an empty square selected and click a different empty square, switch to it
    if (!selectedTile.letter && selectedTile.source === "board") {
      setSelectedTile({
        source: "board",
        x,
        y,
        letter: undefined,
      });
      return;
    }

    // If we have a tile selected, place it at this empty board square
    if (selectedTile.letter) {
      let hasError = false;
      let collapsedWildcard: LetterLiteral | undefined = localProposedMove.find(
        (m) => m.x === selectedTile.x && m.y === selectedTile.y
      )?.collapsedWildcard;

      if (collapsedWildcard == null) {
        ({ collapsedWildcard, hasError } = getWildcardLetter(
          selectedTile.letter,
          template!,
          t("playfield.wildcardPrompt")
        ));
        if (hasError) {
          toast.error(t("playfield.invalidWildcard"));
          return;
        }
      }

      if (selectedTile.source === "hand" && selectedTile.index !== undefined) {
        // Move from hand to board
        const newHand = [...localPlayerHand];
        newHand[selectedTile.index] = null;

        const newProposedMove = [
          ...localProposedMove,
          {
            x,
            y,
            letter: selectedTile.letter,
            collapsedWildcard,
          } satisfies Move,
        ];

        setLocalPlayerHand(newHand as PlayerHandType);
        setLocalProposedMove(newProposedMove);
        setSelectedTile(null);
      } else if (
        selectedTile.source === "board" &&
        selectedTile.x !== undefined &&
        selectedTile.y !== undefined
      ) {
        // Move from board to board
        const newProposedMove = localProposedMove.filter(
          (m) => !(m.x === selectedTile.x && m.y === selectedTile.y)
        );
        newProposedMove.push({
          x,
          y,
          letter: selectedTile.letter,
          collapsedWildcard,
        } satisfies Move);

        setLocalProposedMove(newProposedMove);
        setSelectedTile(null);
      }
    }
  };

  const handleEmptyHandSlotClick = (index: number) => {
    if (!state || !selectedTile || !isMyTurn || state.currentVote) return;

    // Only handle board tiles being moved to empty hand slots
    if (
      selectedTile.source === "board" &&
      selectedTile.letter && // Must have a letter
      selectedTile.x !== undefined &&
      selectedTile.y !== undefined
    ) {
      // Remove tile from board
      const newProposedMove = localProposedMove.filter(
        (m) => !(m.x === selectedTile.x && m.y === selectedTile.y)
      );

      // Add tile to hand at the specified index
      const newHand = [...localPlayerHand];
      newHand[index] = selectedTile.letter;

      setLocalPlayerHand(newHand as PlayerHandType);
      setLocalProposedMove(newProposedMove);
      setSelectedTile(null);
    }
  };

  const performMove = (from: SelectedTile, to: SelectedTile) => {
    if (!state) return;
    if (!from.letter || !to.letter) return; // Both must have letters for swapping

    // If vote is in progress, ignore
    if (state.currentVote) return;

    // Case 1: Reordering within hand (both tiles in hand)
    if (from.source === "hand" && to.source === "hand") {
      if (from.index !== undefined && to.index !== undefined) {
        const newHand = arrayMove(
          localPlayerHand,
          from.index,
          to.index
        ) as PlayerHandType;
        setLocalPlayerHand(newHand);
      }
      return;
    }

    // All the rest require it to be your turn
    if (!isMyTurn || state.currentVote) return;

    // Case 2: From hand to board
    if (
      from.source === "hand" &&
      to.source === "board" &&
      from.index !== undefined &&
      to.x !== undefined &&
      to.y !== undefined
    ) {
      // Swap tiles
      let newHand = [...localPlayerHand];
      let newProposedMove = [...localProposedMove];

      // Remove the destination tile from board and add to hand
      newProposedMove = newProposedMove.filter(
        (m) => !(m.x === to.x && m.y === to.y)
      );
      newHand[from.index] = to.letter;

      // Add the source tile to board
      const { collapsedWildcard, hasError } = getWildcardLetter(
        from.letter,
        template!,
        t("playfield.wildcardPrompt")
      );

      if (hasError) {
        toast.error(t("playfield.invalidWildcard"));
        return;
      }

      newProposedMove.push({
        x: to.x,
        y: to.y,
        letter: from.letter,
        collapsedWildcard,
      });

      setLocalPlayerHand(newHand as PlayerHandType);
      setLocalProposedMove(newProposedMove);
      return;
    }

    // Case 3: From board to hand
    if (
      from.source === "board" &&
      to.source === "hand" &&
      from.x !== undefined &&
      from.y !== undefined &&
      to.index !== undefined
    ) {
      let newHand = [...localPlayerHand];
      let newProposedMove = [...localProposedMove];

      // Swap tiles
      newProposedMove = newProposedMove.filter(
        (m) => !(m.x === from.x && m.y === from.y)
      );
      newProposedMove.push({ x: from.x, y: from.y, letter: to.letter });
      newHand[to.index] = from.letter;

      setLocalPlayerHand(newHand as PlayerHandType);
      setLocalProposedMove(newProposedMove);
      return;
    }

    // Case 4: Board to board (swapping positions)
    if (
      from.source === "board" &&
      to.source === "board" &&
      from.x !== undefined &&
      from.y !== undefined &&
      to.x !== undefined &&
      to.y !== undefined
    ) {
      let fromWildcard: LetterLiteral | undefined = localProposedMove.find(
        (m) => m.x === from.x && m.y === from.y
      )?.collapsedWildcard;
      let toWildcard: LetterLiteral | undefined = localProposedMove.find(
        (m) => m.x === to.x && m.y === to.y
      )?.collapsedWildcard;

      let newProposedMove = localProposedMove.filter(
        (m) => !(m.x === from.x && m.y === from.y)
      );
      newProposedMove = newProposedMove.filter(
        (m) => !(m.x === to.x && m.y === to.y)
      );

      // Swap the tiles
      newProposedMove.push({
        x: to.x,
        y: to.y,
        letter: from.letter,
        collapsedWildcard: fromWildcard,
      });
      newProposedMove.push({
        x: from.x,
        y: from.y,
        letter: to.letter,
        collapsedWildcard: toWildcard,
      });

      setLocalProposedMove(newProposedMove);
      return;
    }
  };

  const isSelected = (
    source: "hand" | "board",
    indexOrX?: number,
    y?: number
  ) => {
    if (!selectedTile) return false;
    if (selectedTile.source !== source) return false;

    if (source === "hand") {
      return selectedTile.index === indexOrX;
    } else {
      return selectedTile.x === indexOrX && selectedTile.y === y;
    }
  };

  return {
    selectedTile,
    handleTileClick,
    handleBoardSquareClick,
    handleEmptyHandSlotClick,
    isSelected,
    clearSelection: () => setSelectedTile(null),
  };
};
