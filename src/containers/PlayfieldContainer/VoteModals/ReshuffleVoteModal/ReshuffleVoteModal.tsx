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
import { PlayerHand } from "../../PlayerHand/PlayerHand";
import { useClickToSelect } from "../../useClickToSelect.hook";
import { useNavigate } from "react-router-dom";

interface Props {
  vote: Vote;
}
export const ReshuffleVoteModal = ({ vote }: Props) => {
  // Hooks
  const { t } = useTranslation();
  const clickToSelectHandlers = useClickToSelect();
  const navigate = useNavigate();

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
      <DialogContent className="min-w-[800px] max-w-[90vw]">
        <button
          onClick={() => navigate("/")}
          className="absolute right-12 top-4 px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
        >
          {t("playfield.backToHome")}
        </button>
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
        <div className="flex flex-row flex-1 gap-2 items-center justify-center">
          <div className="h-fit flex flex-col gap-4 items-center">
            <PlayerVotesButtons
              votes={vote.votes}
              onChangeVote={handleChangeVote}
            />
            <div className="text-lg">{t("reshuffleVote.currentHand")}:</div>
            <PlayerHand clickToSelectHandlers={clickToSelectHandlers} />
          </div>
          <Chat />
        </div>
      </DialogContent>
      <DialogFooter></DialogFooter>
    </Dialog>
  );
};
