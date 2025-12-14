import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { GameState, Move, PlayerHand } from "@/model/core.model";
import { useEffect, useState } from "react";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import {
  createGame,
  deleteGame,
  getGameSnapshot,
  getLastNPlayerGamesSnapshot,
  proposeMove,
  reshuffleInitialPlayerHands,
  updateGame,
} from "./game";
import { DbGamePayload } from "./game.model";

export const useCreateGame = () => {
  const { user } = useAuth();
  if (!user) throw new Error("User not found");
  return (template: LanguageTemplate, callback?: (gameId: string) => void) =>
    createGame(db, user.uid, template).then(callback);
};

type UseGetGameSnapshot = {
  state: GameState | undefined;
  template: LanguageTemplate | undefined;
  createdByUserId: string | undefined;
  hasError: boolean;
};
export const useGetGameSnapshot = (gameId: string): UseGetGameSnapshot => {
  const [state, setState] = useState<GameState | undefined>();
  const [template, setTemplate] = useState<LanguageTemplate | undefined>();
  const [createdByUserId, setCreatedByUserId] = useState<string | undefined>();
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(
    () =>
      getGameSnapshot(
        db,
        gameId,
        (newS, newT, newId) => {
          setHasError(false);
          setState(newS);
          setTemplate(newT);
          setCreatedByUserId(newId);
        },
        setHasError
      ),
    [gameId]
  );

  return { state, template, createdByUserId, hasError };
};

export const useUpdateGame = (gameId: string) => {
  return async (game: Partial<DbGamePayload>) => {
    try {
      await updateGame(db, gameId, game);
    } catch (err) {
      console.error("Failed to update user config:", err);
    }
  };
};

export const useProposeMove = (gameId: string) => {
  const { user } = useAuth();

  return async (move: Move[], hand: PlayerHand, state: GameState) => {
    try {
      await proposeMove(db, gameId, move, hand, state, user);
    } catch (err) {
      console.error("Failed to propose move:", err);
    }
  };
};

export const useReshuffleGame = (gameId: string) => {
  return async (currState: GameState, currTemplate: LanguageTemplate) => {
    try {
      await reshuffleInitialPlayerHands(db, gameId, currState, currTemplate);
    } catch (err) {
      console.error("Failed to reshuffle game:", err);
    }
  };
};

export const useDeleteGame = () => {
  return async (gameId: string) => {
    try {
      await deleteGame(db, gameId);
    } catch (err) {
      console.error("Failed to delete game:", err);
    }
  };
};

export const useGetLastNPlayerGames = (
  n: number = 10
): {
  playerGames: (GameState & { id: string })[] | undefined;
  error: string | undefined;
} => {
  const { user } = useAuth();
  const [playerGames, setGames] = useState<
    (GameState & { id: string })[] | undefined
  >();
  const [error, setError] = useState<string | undefined>();

  useEffect(
    () =>
      getLastNPlayerGamesSnapshot(
        db,
        user!.uid,
        n,
        (data) => {
          setGames(data);
        },
        (err) => {
          setError(err);
        }
      ),
    []
  );

  return { playerGames, error };
};
