import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { PlayerVote } from "@/model/core.model";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlayerBadge } from "../../PlayerBadge/PlayerBadge";

interface Props {
  votes: PlayerVote[];
  onChangeVote: (playerId: string, value: boolean | null) => void;
}

export const PlayerVotesButtons = ({ votes, onChangeVote }: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="grid gap-2 rounded-md p-2 grid-cols-2">
      {votes.map(({ playerId, voted }) => {
        const showSwitches = user!.uid === playerId;

        const className = cn(
          "flex gap-2 items-center justify-center flex-col border rounded-md p-2",
          voted === true
            ? "border-green-600 bg-green-100"
            : voted === false
            ? "border-red-600 bg-red-100"
            : "border-gray-300 bg-gray-100"
        );
        const acceptButtonClassname = cn(
          voted === true ? "border-yellow-300 border border-4" : "",
          "bg-green-500"
        );
        const rejectButtonClassname = cn(
          voted === false ? "border-yellow-300 border border-4" : ""
        );

        return (
          <div key={playerId} className={className}>
            <PlayerBadge playerId={playerId} />

            {showSwitches ? (
              <div className="flex flex-row gap-2 text-xs">
                <Button
                  className={acceptButtonClassname}
                  onClick={() =>
                    onChangeVote(playerId, voted !== true ? true : null)
                  }
                >
                  {t("playerVotes.accept")}
                </Button>
                <Button
                  className={rejectButtonClassname}
                  variant={"destructive"}
                  onClick={() =>
                    onChangeVote(playerId, voted !== false ? false : null)
                  }
                >
                  {t("playerVotes.reject")}
                </Button>
              </div>
            ) : voted === null ? (
              <i className="text-sm text-gray-500">{t("playerVotes.awaitingVote")}</i>
            ) : voted ? (
              <Check />
            ) : (
              <X />
            )}
          </div>
        );
      })}
    </div>
  );
};
