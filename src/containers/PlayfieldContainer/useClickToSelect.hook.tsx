import { useGameContext } from "@/contexts/GameState.context";
import {
  LetterLiteral,
  PlayerHand as PlayerHandType,
} from "@/model/core.model";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";

export interface SelectedTile {
  letter: LetterLiteral;
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
    setLocalProposedMove,
    isMyTurn,
  } = useGameContext();

  const [selectedTile, setSelectedTile] = useState<SelectedTile | null>(null);

  const handleTileClick = (tile: SelectedTile) => {
    if (!state) return;

    // If clicking the same tile, deselect it
    if (
      selectedTile &&
      selectedTile.source === tile.source &&
      ((tile.source === "hand" && selectedTile.index === tile.index) ||
        (tile.source === "board" &&
          selectedTile.x === tile.x &&
          selectedTile.y === tile.y))
    ) {
      setSelectedTile(null);
      return;
    }

    // If no tile is selected, select this one
    if (!selectedTile) {
      setSelectedTile(tile);
      return;
    }

    // If a tile is selected, perform the move/swap
    performMove(selectedTile, tile);
    setSelectedTile(null);
  };

  const handleBoardSquareClick = (x: number, y: number) => {
    if (!state || !selectedTile || !isMyTurn || state.currentVote) return;

    // If there's a tile already at this position, don't handle it here
    // (it should be handled by handleTileClick)
    if (state.board[y][x].tile) return;

    const proposedTileAtPosition = localProposedMove.find(
      (m) => m.x === x && m.y === y
    );
    if (proposedTileAtPosition) return; // Will be handled by handleTileClick

    // Place the selected tile at this empty board square
    if (selectedTile.source === "hand" && selectedTile.index !== undefined) {
      // Move from hand to board
      const newHand = [...localPlayerHand];
      newHand[selectedTile.index] = null;
      const newProposedMove = [
        ...localProposedMove,
        { x, y, letter: selectedTile.letter },
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
      newProposedMove.push({ x, y, letter: selectedTile.letter });

      setLocalProposedMove(newProposedMove);
      setSelectedTile(null);
    }
  };

  const handleEmptyHandSlotClick = (index: number) => {
    if (!state || !selectedTile || !isMyTurn || state.currentVote) return;

    // Only handle board tiles being moved to empty hand slots
    if (
      selectedTile.source === "board" &&
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
      newProposedMove.push({ x: to.x, y: to.y, letter: from.letter });

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

      // If there's a tile in the hand slot, put it on the board
      if (to.letter) {
        newProposedMove = newProposedMove.filter(
          (m) => !(m.x === from.x && m.y === from.y)
        );
        newProposedMove.push({ x: from.x, y: from.y, letter: to.letter });
        newHand[to.index] = from.letter;
      } else {
        // Just move the tile back to hand
        newProposedMove = newProposedMove.filter(
          (m) => !(m.x === from.x && m.y === from.y)
        );
        newHand[to.index] = from.letter;
      }

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
      let newProposedMove = localProposedMove.filter(
        (m) => !(m.x === from.x && m.y === from.y)
      );
      newProposedMove = newProposedMove.filter(
        (m) => !(m.x === to.x && m.y === to.y)
      );

      // Swap the tiles
      newProposedMove.push({ x: to.x, y: to.y, letter: from.letter });
      newProposedMove.push({ x: from.x, y: from.y, letter: to.letter });

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
