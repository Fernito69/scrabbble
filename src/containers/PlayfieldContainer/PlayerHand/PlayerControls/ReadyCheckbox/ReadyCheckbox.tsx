import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { Vote } from "@/model/core.model";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { getInitGamePayload } from "@/services/collections/game/game.utils";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

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
      updateGame(getInitGamePayload(state));
    }
  }, [vote]);

  // Consts
  const voted = vote.votes.find((v) => v.playerId === user!.uid)?.voted;
  const className = cn(
    "flex flex-col gap-1 items-center justify-center w-full h-full border-1 border rounded-sm p-2",
    voted ? "border-green-600 bg-green-100" : "border-gray-400 bg-gray-200"
  );

  // Render
  return (
    <div className={className}>
      <div className="text-muted-foreground whitespace-nowrap w-full flex flex-row gap-2 justify-center text-sm">
        {t("readyCheckbox.ready")}
      </div>
      <Checkbox
        className="bg-white"
        checked={voted!!}
        onCheckedChange={handleChangeVote}
      />
    </div>
  );
};
