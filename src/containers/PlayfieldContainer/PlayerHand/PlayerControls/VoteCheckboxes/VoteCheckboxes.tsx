import { UserAvatar } from "@/components/UserAvatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";

interface Props {
  handleChangeVote: () => void;
}
export const VoteCheckboxes = ({ handleChangeVote }: Props) => {
  // Context
  const { user } = useAuth();
  const { state } = useGameContext();

  if (!state) return null;

  // Render
  return (
    <div className="grid grid-cols-4 gap-2 items-center">
      {state.playerIds.map((id, i) => {
        if (id === null)
          return (
            <div
              className="flex flex-col gap-1 items-center justify-center w-full h-full border rounded-sm p-1 border-gray-600 bg-gray-100"
              key={i}
            >
              -
            </div>
          );

        const isChecked: boolean | null = state.currentVote?.votes.find(
          (v) => v.playerId === id
        )?.voted!;
        const className = cn(
          "flex flex-col gap-1 items-center justify-center w-full h-full border rounded-sm p-1",
          isChecked === null
            ? "border-gray-500 bg-gray-200"
            : isChecked
            ? "border-green-600 bg-green-100"
            : "border-red-600 bg-red-100"
        );

        return (
          <div className={className} key={i}>
            <UserAvatar
              userId={id}
              diameter={24}
              shadingIndex={state.playerIds.indexOf(id)}
            />
            {id === user!.uid ? (
              <Checkbox
                className="bg-white"
                checked={isChecked}
                onCheckedChange={handleChangeVote}
              />
            ) : isChecked === null ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : isChecked ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </div>
        );
      })}
    </div>
  );
};
