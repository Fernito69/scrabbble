import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { TileComponent } from "../TileComponent/TileComponent";

export const PlayerHand = () => {
  const { state } = useGameContext();
  const { user } = useAuth();

  const playerHand = state?.playerHands?.[user!.uid];

  if (!playerHand) return null;

  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full flex justify-center items-center w-[720px] bg-green-200 p-2 border border-black rounded-md">
        <div className="grid grid-cols-7 gap-2 w-[500px] bg-green-800 p-2 border border-black rounded-md items-center justify-center">
          {playerHand.map((letter, i) => (
            <div
              key={i}
              className="flex w-16 h-16 bg-gray-500 border border-black rounded-md items-center justify-center"
            >
              <TileComponent letter={letter} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
