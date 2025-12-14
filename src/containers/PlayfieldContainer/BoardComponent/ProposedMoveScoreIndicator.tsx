import { Move } from "@/model/core.model";
import { ScoringService } from "@/services/scoring";
import { useGameContext } from "@/contexts/GameState.context";
import { useMemo } from "react";

interface ProposedMoveScoreIndicatorProps {
  proposedMove: Move[];
  playerId: string;
}

export const ProposedMoveScoreIndicator = ({
  proposedMove,
  playerId,
}: ProposedMoveScoreIndicatorProps) => {
  const { state, template, localPlayerHand } = useGameContext();

  const { score, centerX, centerY } = useMemo(() => {
    if (!state || !template || proposedMove.length === 0) {
      return { score: 0, centerX: 0, centerY: 0 };
    }

    // Calculate score using ScoringService
    const scoringService = new ScoringService(state.board, template);
    const playerMove = {
      playerId,
      move: proposedMove,
      tentativeNewHand: localPlayerHand,
    };

    let calculatedScore = 0;
    try {
      const result = scoringService.score(playerMove);
      calculatedScore = result.score;
    } catch (error) {
      // If scoring fails (invalid move), show 0
      console.error("Failed to calculate score:", error);
    }

    // Calculate center of mass (average x and y coordinates)
    const avgX =
      proposedMove.reduce((sum, move) => sum + move.x, 0) / proposedMove.length;
    const avgY =
      proposedMove.reduce((sum, move) => sum + move.y, 0) / proposedMove.length;

    return {
      score: calculatedScore,
      centerX: avgX,
      centerY: avgY,
    };
  }, [proposedMove, state, template, playerId, localPlayerHand]);

  if (proposedMove.length === 0 || score === 0) {
    return null;
  }

  // Each square is 48px (720px / 15 squares), calculate pixel position
  const squareSize = 48;
  const pixelX = centerX * squareSize;
  const pixelY = centerY * squareSize;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${pixelX}px`,
        top: `${pixelY}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative">
        {/* Pulsating glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-md animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, rgba(251, 191, 36, 0) 70%)",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />

        {/* Main score display */}
        <div
          className="relative bg-gradient-to-br from-amber-400 to-yellow-500 text-white font-bold text-lg px-2 py-1 rounded-full shadow-lg border-2 border-amber-300"
          style={{
            animation: "float 3s ease-in-out infinite",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          +{score}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};
