import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { PlayerBadge } from "../../PlayerBadge/PlayerBadge";
import { PlayerVote } from "@/model/core.model";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  votes: PlayerVote[];
  onChangeVote: (playerId: string) => void;
}

export const PlayerVotes = ({ votes, onChangeVote }: Props) => {
  const { user } = useAuth();

  return (
    <div className="grid gap-2 rounded-md p-2 grid-cols-2">
      {votes.map(({ playerId, voted }) => {
        const showCheckbox = user!.uid === playerId;
        const className = cn(
          "flex gap-2 items-center justify-center flex-col border rounded-md p-2",
          voted ? "border-green-600 bg-green-100" : "border-red-600 bg-red-100"
        );
        return (
          <div key={playerId} className={className}>
            <PlayerBadge playerId={playerId} />

            {showCheckbox ? (
              <Checkbox
                className="bg-white"
                checked={voted!!}
                onCheckedChange={() => onChangeVote(playerId)}
              />
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
