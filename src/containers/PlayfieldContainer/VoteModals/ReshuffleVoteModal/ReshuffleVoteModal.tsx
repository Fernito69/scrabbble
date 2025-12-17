import { UserAvatar } from "@/components/UserAvatar";
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
import { useTranslation } from "react-i18next";
import { PlayerVotesButtons } from "../PlayerVotesButtons/PlayerVotesButtons";
import { Chat } from "@/components/Chat/Chat";

interface Props {
  vote: Vote;
}
export const ReshuffleVoteModal = ({ vote }: Props) => {
  // Hooks
  const { t } = useTranslation();

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

  // Render
  return (
    <Dialog open>
      <DialogContent className="min-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-row gap-2 items-center">
              {vote.proposerId ? (
                <UserAvatar userId={vote.proposerId} diameter={24} />
              ) : (
                t("reshuffleVote.aPlayer")
              )}
              {t("reshuffleVote.titlePrefix")}
            </div>
          </DialogTitle>
          <DialogDescription>
            {t("reshuffleVote.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row flex-1 gap-2 items-center">
          <div className="h-fit">
            <PlayerVotesButtons
              votes={vote.votes}
              onChangeVote={handleChangeVote}
            />
          </div>
          <Chat />
        </div>
      </DialogContent>
      <DialogFooter></DialogFooter>
    </Dialog>
  );
};
