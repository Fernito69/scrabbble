import { PlayfieldContainer } from "@/containers/PlayfieldContainer/PlayfieldContainer";
import { GameStateProvider } from "@/contexts/GameState.context";
import { useParams } from "react-router-dom";

export const Playfield = () => {
  const gameId = useParams().gameId;

  if (!gameId) {
    return (
      <div className="w-full h-full flex justify-center items-center text-3xl">
        Game ID not found
      </div>
    );
  }

  return (
    <GameStateProvider gameId={gameId}>
      <PlayfieldContainer />
    </GameStateProvider>
  );
};
