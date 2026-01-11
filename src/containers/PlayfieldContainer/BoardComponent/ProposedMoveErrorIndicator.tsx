import { Move } from "@/model/core.model";
import { useMemo } from "react";

interface ProposedMoveErrorIndicatorProps {
  proposedMove: Move[];
  errorMessage: string;
}

export const ProposedMoveErrorIndicator = ({
  proposedMove,
  errorMessage,
}: ProposedMoveErrorIndicatorProps) => {
  const { centerX, centerY } = useMemo(() => {
    if (proposedMove.length === 0) {
      return { centerX: 0, centerY: 0 };
    }

    // Calculate center of mass (average x and y coordinates)
    const avgX =
      proposedMove.reduce((sum, move) => sum + move.x, 0) / proposedMove.length;
    const avgY =
      proposedMove.reduce((sum, move) => sum + move.y, 0) / proposedMove.length;

    return {
      centerX: avgX,
      centerY: avgY,
    };
  }, [proposedMove]);

  if (proposedMove.length === 0) {
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
          className="absolute inset-0 rounded-lg blur-md animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, rgba(239, 68, 68, 0) 70%)",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />

        {/* Main error display */}
        <div
          className="relative bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold text-sm px-1 py-1 rounded-lg shadow-lg border-2 border-orange-400 whitespace-nowrap"
          style={{
            animation: "float 3s ease-in-out infinite",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          ⚠️ {errorMessage}
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
