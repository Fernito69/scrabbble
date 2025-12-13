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
import { PlayerBadge } from "../../PlayerBadge/PlayerBadge";
import { PlayerVotesButtons } from "../PlayerVotesButtons/PlayerVotesButtons";

interface Props {
  vote: Vote;
}
export const ReshuffleVoteModal = ({ vote }: Props) => {
  // Context
  const { gameId } = useGameContext();

  // Data
  const updateGame = useUpdateGame(gameId);

  // Handlers
  const handleChangeVote = (playerId: string, voted: boolean | null) => {
    updateGame({
      currentVote: {
        ...vote,
        votes: vote.votes.map((v) =>
          v.playerId === playerId ? { ...v, voted } : v
        ),
      },
    });
  };

  // Consts
  const proposerName = vote.proposerId ? (
    <PlayerBadge playerId={vote.proposerId} />
  ) : (
    "A player"
  );

  // Render
  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-row gap-2">
              {proposerName} has requested a hand reshuffle
            </div>
          </DialogTitle>
          <DialogDescription>
            Please accept or reject the request
          </DialogDescription>
        </DialogHeader>
        <PlayerVotesButtons
          votes={vote.votes}
          onChangeVote={handleChangeVote}
        />
      </DialogContent>
      <DialogFooter></DialogFooter>
    </Dialog>
  );
};
