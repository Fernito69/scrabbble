import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { useTranslation } from "react-i18next";
import { VoteCheckboxes } from "../VoteCheckboxes/VoteCheckboxes";

export const AcceptProposedMoveCheckbox = () => {
  // Hooks
  const { t } = useTranslation();

  // Context
  const { gameId, state } = useGameContext();
  const { user } = useAuth();

  // Mutations
  const updateGame = useUpdateGame(gameId);

  if (!state || !state.currentVote) return null;

  // Handlers
  const handleChangeVote = () => {
    if (!state.currentVote) return;
    if (
      state.currentPlayerId === user!.uid &&
      !window.confirm(t("acceptMove.rejectOwnMove"))
    )
      return;

    updateGame({
      currentVote: {
        ...state.currentVote,
        votes: state.currentVote.votes.map((v) =>
          v.playerId === user!.uid ? { ...v, voted: !v.voted } : v
        ),
      },
    });
  };

  // Consts

  const className = cn(
    "flex flex-col gap-1 items-center justify-center w-full h-100 p-2"
  );

  // Render
  return (
    <div className={className}>
      <div className="text-xs flex flex-row gap-2 items-center">
        {t("acceptMove.acceptFrom")}
        <UserAvatar
          userId={state.currentPlayerId!}
          shadingIndex={state.playerIds.indexOf(state.currentPlayerId!)}
          diameter={24}
        />
      </div>
      <VoteCheckboxes handleChangeVote={handleChangeVote} />
    </div>
  );
};
