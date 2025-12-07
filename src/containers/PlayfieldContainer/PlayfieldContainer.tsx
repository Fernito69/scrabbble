import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import {
  LetterLiteral,
  PlayerHand as PlayerHandType,
  VoteType,
} from "@/model/core.model";
import { authService } from "@/services/auth";
import { updateGame } from "@/services/collections/game/game";
import { DbGamePayload } from "@/services/collections/game/game.model";
import {
  useGetPlayerName,
  useGetUserConfig,
} from "@/services/collections/userConfig/userConfig.hooks";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BoardComponent } from "./BoardComponent/BoardComponent";
import { PlayerHand } from "./PlayerHand/PlayerHand";
import { TileComponent } from "./TileComponent/TileComponent";
import { StartVoteModal } from "./VoteModals/StartVoteModal/StartVoteModal";
import { ScoreBoard } from "./ScoreBoard/ScoreBoard";

export const PlayfieldContainer = () => {
  // Hooks
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    state,
    gameId,
    localPlayerHand,
    localProposedMove,
    setLocalPlayerHand,
    setLocalProposedMove,
    isMyTurn,
  } = useGameContext();
  const getPlayerName = useGetPlayerName();

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
  const handleBack = () => {
    // Remove the user from the game
    updateGame(db, gameId, {
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

    if (!over || !state || !user) return;

    const activeSource = active.data.current?.source;
    const activeLetter = active.data.current?.letter as LetterLiteral | null;

    // If vote is in progress, ignore
    if (state.currentVote) return;

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
      return;
    }

    // All the rest of the cases are only for the current player
    if (!isMyTurn) return;

    // Case 2: Dragging from hand to board
    if (activeSource === "hand" && over.data.current?.type === "board-square") {
      const x = over.data.current.x;
      const y = over.data.current.y;
      const sourceIndex = active.data.current?.index;

      if (activeLetter && typeof x === "number" && typeof y === "number") {
        // If there's already a positioned tile, cancel
        if (state.board[y][x].tile) return;

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
        newProposedMove.push({ x, y, letter: activeLetter });

        setLocalPlayerHand(newHand);
        setLocalProposedMove(newProposedMove);
      }
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

      if (
        activeLetter &&
        typeof fromX === "number" &&
        typeof fromY === "number" &&
        typeof toX === "number" &&
        typeof toY === "number"
      ) {
        // Check if there's a tile at the destination
        const existingTileAtDestination = localProposedMove.find(
          (m) => m.x === toX && m.y === toY
        );

        let newProposedMove = localProposedMove.filter(
          (m) => !(m.x === fromX && m.y === fromY)
        );

        if (existingTileAtDestination) {
          // Swap: move destination tile to source position
          newProposedMove = newProposedMove.filter(
            (m) => !(m.x === toX && m.y === toY)
          );
          newProposedMove.push({
            x: fromX,
            y: fromY,
            letter: existingTileAtDestination.letter,
          });
        }

        // Move the dragged tile to destination
        newProposedMove.push({ x: toX, y: toY, letter: activeLetter });

        setLocalProposedMove(newProposedMove);
      }
      return;
    }
  };

  // Data
  const userConfig = useGetUserConfig();

  if (!state) return null;

  // Consts
  const userName = userConfig?.displayName ?? user?.email;
  const showStartVoteModal =
    state.currentVote?.type === VoteType.START_VOTE &&
    !state.currentVote?.voteFinished;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Playfield</h1>
              <p className="text-muted-foreground mt-1">Welcome, {userName}</p>
            </div>
            <div className="flex gap-4">
              {!state.gameStarted && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
                >
                  Leave Game
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <div className="flex flex-row gap-2 mb-4">
              <Badge
                label="Players:"
                value={(state.playerIds ?? [])
                  .filter(Boolean)
                  .map(getPlayerName)
                  .join(", ")}
              />
              {state.gameStarted && (
                <>
                  <Badge label="Turn:" value={state.currentTurn} />
                  {state.currentPlayerId != null && (
                    <Badge
                      label="Current move:"
                      value={getPlayerName(state.currentPlayerId)}
                    />
                  )}
                  <Badge label="Tiles left:" value={state.tilePouch.length} />
                </>
              )}
            </div>
            <BoardComponent />
          </div>
          {showStartVoteModal && <StartVoteModal vote={state!.currentVote!} />}
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col justify-between items-center mb-8 gap-4">
            <PlayerHand />
            <ScoreBoard />
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeLetter ? <TileComponent letter={activeLetter} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

/**********/
interface BadgeProps<T extends string | number = string | number> {
  label: string;
  value: T;
  color?: string;
}
export const Badge = ({
  label,
  value,
  color = "border-green-300",
}: BadgeProps) => {
  const className = cn(
    "flex flex-row gap-2 border-2 rounded-md p-2 shadow text-muted-foreground text-sm w-fit",
    color
  );

  return (
    <div className={className}>
      <b>{label}</b>
      <span>{value}</span>
    </div>
  );
};
