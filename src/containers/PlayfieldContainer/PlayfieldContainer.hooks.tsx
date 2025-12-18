import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import {
  LetterLiteral,
  PlayerHand as PlayerHandType,
} from "@/model/core.model";
import { authService } from "@/services/auth";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { DbGamePayload } from "@/services/collections/game/game.model";
import { getWildcardLetter } from "@/services/collections/game/game.utils";
import {
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const usePlayfieldHandlers = (clearSelection: () => void) => {
  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    state,
    gameId,
    localPlayerHand,
    localProposedMove,
    setLocalPlayerHand,
    setLocalProposedMove,
    template,
    isMyTurn,
  } = useGameContext();

  // Data
  const updateGame = useUpdateGame(gameId);

  // Drag and drop state
  const [activeLetter, setActiveLetter] = useState<LetterLiteral | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    })
  );

  // Handlers
  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  // Handlers
  const handleLeave = () => {
    // TODO: handle this properly
    // Remove the user from the game
    updateGame({
      playerIds: state!.playerIds.map((v) =>
        v === user!.uid ? null : v
      ) as DbGamePayload["playerIds"],
    });
    navigate("/");
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const letter = active.data.current?.letter;
    setActiveLetter(letter);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveLetter(null);

    if (!over || !state || !user) {
      clearSelection();
      return;
    }

    const activeSource = active.data.current?.source;
    const activeLetter = active.data.current?.letter as LetterLiteral | null;

    // If vote is in progress, ignore
    if (state.currentVote) {
      clearSelection();
      return;
    }

    // Case 1: Reordering within hand
    if (activeSource === "hand" && over.data.current?.source === "hand") {
      const oldIndex = active.data.current?.index;
      const newIndex = over.data.current?.index;

      if (oldIndex !== newIndex) {
        const newHand = arrayMove(
          localPlayerHand,
          oldIndex,
          newIndex
        ) as PlayerHandType;
        setLocalPlayerHand(newHand);
      }
      clearSelection();
      return;
    }

    // All the rest of the cases are only for the current player
    if (!isMyTurn) {
      clearSelection();
      return;
    }

    // Case 2: Dragging from hand to board
    if (activeSource === "hand" && over.data.current?.type === "board-square") {
      const x = over.data.current.x;
      const y = over.data.current.y;
      const sourceIndex = active.data.current?.index;

      if (activeLetter && typeof x === "number" && typeof y === "number") {
        // If there's already a positioned tile, cancel
        if (state.board[y][x].tile) {
          clearSelection();
          return;
        }

        const { collapsedWildcard, hasError } = getWildcardLetter(
          activeLetter,
          template!,
          t("playfield.wildcardPrompt")
        );
        if (hasError) {
          toast.error(t("playfield.invalidWildcard"));
          return;
        }

        // Check if there's already a proposed tile at this position
        const existingTileAtPosition = localProposedMove.find(
          (m) => m.x === x && m.y === y
        );

        let newHand: PlayerHandType = [...localPlayerHand];
        let newProposedMove = [...localProposedMove];

        // If there's an existing tile, return it to hand
        if (existingTileAtPosition) {
          newHand.splice(sourceIndex, 1);
          newHand.push(existingTileAtPosition.letter);
          // Remove the old tile from proposed moves
          newProposedMove = newProposedMove.filter(
            (m) => !(m.x === x && m.y === y)
          );
        } else {
          newHand[sourceIndex] = null;
        }

        // Add the new move
        newProposedMove.push({ x, y, letter: activeLetter, collapsedWildcard });

        setLocalPlayerHand(newHand);
        setLocalProposedMove(newProposedMove);
      }
      clearSelection();
      return;
    }

    // Case 3: Dragging from board to hand
    if (
      activeSource === "board" &&
      (over.data.current?.type === "hand-zone" ||
        over.data.current?.source === "hand")
    ) {
      const boardX = active.data.current?.x;
      const boardY = active.data.current?.y;

      if (
        activeLetter &&
        typeof boardX === "number" &&
        typeof boardY === "number"
      ) {
        // Add tile back to hand
        let filtered = false;
        const newHand = [
          ...localPlayerHand.filter((v) => {
            if (v !== null) return true;
            if (!filtered) {
              filtered = true;
              return false;
            }
            return true;
          }),
          activeLetter,
        ] as PlayerHandType;

        // Remove from proposed moves
        const newProposedMove = localProposedMove.filter(
          (m) => !(m.x === boardX && m.y === boardY)
        );

        setLocalPlayerHand(newHand);
        setLocalProposedMove(newProposedMove);
      }
      clearSelection();
      return;
    }

    // Case 4: Dragging from board to board (swapping positions)
    if (
      activeSource === "board" &&
      over.data.current?.type === "board-square"
    ) {
      const fromX = active.data.current?.x;
      const fromY = active.data.current?.y;
      const toX = over.data.current.x;
      const toY = over.data.current.y;

      // Cancel if there's a tile at the destination
      if (state.board[toY][toX].tile) {
        clearSelection();
        return;
      }

      if (
        activeLetter &&
        typeof fromX === "number" &&
        typeof fromY === "number" &&
        typeof toX === "number" &&
        typeof toY === "number"
      ) {
        // Check if there's a proposed move at the destination
        const existingMoveAtDestination = localProposedMove.find(
          (m) => m.x === toX && m.y === toY
        );
        const existingWildcardAtDestination =
          existingMoveAtDestination?.collapsedWildcard;

        // Check if there's a wildcard at the origin
        let collapsedWildcard: LetterLiteral | undefined =
          localProposedMove.find(
            (m) => m.x === fromX && m.y === fromY
          )?.collapsedWildcard;
        let hasError = false;

        if (collapsedWildcard == null) {
          ({ collapsedWildcard, hasError } = getWildcardLetter(
            activeLetter,
            template!,
            t("playfield.wildcardPrompt")
          ));
          if (hasError) {
            toast.error(t("playfield.invalidWildcard"));
            return;
          }
        }

        let newProposedMove = localProposedMove.filter(
          (m) => !(m.x === fromX && m.y === fromY)
        );

        if (existingMoveAtDestination) {
          // Swap: move destination tile to source position
          newProposedMove = newProposedMove.filter(
            (m) => !(m.x === toX && m.y === toY)
          );
          newProposedMove.push({
            x: fromX,
            y: fromY,
            letter: existingMoveAtDestination.letter,
            collapsedWildcard: existingWildcardAtDestination,
          });
        }

        // Move the dragged tile to destination
        newProposedMove.push({
          x: toX,
          y: toY,
          letter: activeLetter,
          collapsedWildcard,
        });

        setLocalProposedMove(newProposedMove);
      }
      clearSelection();
      return;
    }

    // Clear selection for any unhandled cases
    clearSelection();
  };

  const handleInvitePlayers = async () => {
    const currentUrl = window.location.href;
    const inviteMessage = t("playfield.inviteMessage", { url: currentUrl });

    try {
      await navigator.clipboard.writeText(inviteMessage);
      toast.success(t("playfield.linkCopied"));
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleSignOut,
    handleLeave,
    handleInvitePlayers,
    sensors,
    activeLetter,
  };
};
