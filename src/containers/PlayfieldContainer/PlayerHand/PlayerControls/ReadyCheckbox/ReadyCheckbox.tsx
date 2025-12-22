import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { Vote } from "@/model/core.model";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { VoteCheckboxes } from "../VoteCheckboxes/VoteCheckboxes";

interface Props {
  vote: Vote;
}
export const ReadyCheckbox = ({ vote }: Props) => {
  // Hooks
  const { t } = useTranslation();

  // Context
  const { numPlayers, gameId, state, isGameOrganizer } = useGameContext();
  const { user } = useAuth();

  // Mutations
  const updateGame = useUpdateGame(gameId);

  // Handlers
  const handleChangeVote = () => {
    updateGame({
      currentVote: {
        ...vote,
        votes: vote.votes.map((v) =>
          v.playerId === user!.uid ? { ...v, voted: !v.voted } : v
        ),
      },
    });
  };

  /*********/
  // Effects

  // New player joined
  // TODO: refactor this to the trigger
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

  // Consts
  const voted = vote.votes.find((v) => v.playerId === user!.uid)?.voted;
  const className = cn(
    "flex flex-col gap-1 items-center justify-center w-full h-full border-1 border rounded-sm p-2",
    voted ? "border-green-500 bg-green-50" : "border-gray-400 bg-gray-200"
  );

  // Render
  return (
    <div className={className}>
      <div className="text-muted-foreground whitespace-nowrap w-full flex flex-row gap-2 justify-center text-sm">
        {t("readyCheckbox.ready")}
      </div>
      <VoteCheckboxes handleChangeVote={handleChangeVote} />
    </div>
  );
};
