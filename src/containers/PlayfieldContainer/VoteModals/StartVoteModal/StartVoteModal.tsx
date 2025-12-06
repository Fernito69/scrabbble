import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGameContext } from "@/contexts/GameState.context";
import { LetterLiteral, Vote } from "@/model/core.model";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { useEffect } from "react";
import { PlayerVotes } from "../PlayerVotes/PlayerVotes";
import { cloneDeep } from "lodash";

interface Props {
  vote: Vote;
}
export const StartVoteModal = ({ vote }: Props) => {
  // Context
  const { numPlayers, gameId, state, isGameOrganizer } = useGameContext();

  // Mutations
  const updateGame = useUpdateGame(gameId);

  // Handlers
  const handleChangeVote = (playerId: string) => {
    updateGame({
      currentVote: {
        ...vote,
        votes: vote.votes.map((v) =>
          v.playerId === playerId ? { ...v, voted: !v.voted } : v
        ),
      },
    });
  };

  /*********/
  // Effects

  // New player joined
  useEffect(() => {
    // This means a new player joined the game
    if (isGameOrganizer && numPlayers > vote.votes.length) {
      const newPlayerIds = (state?.playerIds ?? []).filter(
        (id) => id != null && !vote.votes.some((v) => v.playerId === id)
      ) as string[];

      updateGame({
        currentVote: {
          ...vote,
          votes: [
            ...vote.votes,
            ...newPlayerIds.map((id) => ({ playerId: id, voted: false })),
          ],
        },
      });
    }
  }, [vote]);

  // Vote passed!
  useEffect(() => {
    // This means all players are ready, so we start the game
    if (
      isGameOrganizer &&
      state &&
      !state.gameStarted &&
      vote.votes.every((v) => v.voted)
    ) {
      // Initialize player hands and update pouch
      const tilePouch = cloneDeep(state.tilePouch);
      const playerHands: Record<string, LetterLiteral[]> =
        state.playerIds.reduce(
          (acc, id) =>
            id != null ? { ...acc, [id]: tilePouch.splice(0, 7) } : acc,
          {} satisfies Record<string, LetterLiteral[]>
        );

      updateGame({
        currentVote: null,
        gameStarted: true,
        playerHands,
        tilePouch,
      });
    }
  }, [vote]);

  // Render
  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ready yourself!</DialogTitle>
          <DialogDescription>{vote.description}</DialogDescription>
        </DialogHeader>
        <PlayerVotes votes={vote.votes} onChangeVote={handleChangeVote} />
      </DialogContent>
      <DialogFooter></DialogFooter>
    </Dialog>
  );
};
