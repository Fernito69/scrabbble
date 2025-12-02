import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGameContext } from "@/contexts/GameState.context";
import { Vote } from "@/model/core.model";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { useEffect } from "react";
import { PlayerVotes } from "../PlayerVotes/PlayerVotes";

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
    // This means all players are ready
    if (isGameOrganizer && vote.votes.every((v) => v.voted)) {
      updateGame({
        currentVote: null,
        gameStarted: true,
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
