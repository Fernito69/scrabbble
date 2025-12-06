import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { LetterLiteral } from "@/model/core.model";
import { Star } from "lucide-react";

interface Props {
  letter: LetterLiteral;
  proposedMove?: boolean;
}
export const TileComponent = ({ letter, proposedMove = false }: Props) => {
  const { template } = useGameContext();

  const letterScore = template?.scoreMap[letter];

  if (letterScore == null) return null;

  const tileClassName = cn(
    "h-12 w-12 flex items-center justify-center text-2xl border-2 rounded-md h-full shadow",
    proposedMove
      ? "border-red-500 bg-yellow-300 text-red-800 animate-pulse-scale"
      : "border-gray-300 bg-gray-50 text-gray-400"
  );

  return (
    <div className="relative h-12 w-12">
      <div className={tileClassName}>
        {letter !== "0" ? (
          letter.toUpperCase()
        ) : (
          <Star className="text-yellow-500 h-5 w-5" />
        )}
      </div>
      {letterScore > 0 && (
        <div className="absolute bottom-[2px] right-1 text-[10px]">
          <i className="text-red-800 font-bold">{letterScore}</i>
        </div>
      )}
    </div>
  );
};
