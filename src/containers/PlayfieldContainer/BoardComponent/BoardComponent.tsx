import { useGameContext } from "@/contexts/GameState.context";
import { Bonus, Move } from "@/model/core.model";
import { TileComponent } from "../TileComponent/TileComponent";
import { DroppableBoardSquare } from "./DroppableBoardSquare";
import { DraggableBoardTile } from "../TileComponent/DraggableBoardTile";
import { ProposedMoveScoreIndicator } from "./ProposedMoveScoreIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useClickToSelect } from "../useClickToSelect.hook";
import { OverlayWithLoader } from "@/components/OverlayWithLoader/OverlayWithLoader";
import { useTranslation } from "react-i18next";

const bonusColorMap: Record<Bonus, string> = {
  [Bonus.DOUBLE_LETTER]: "bg-blue-200",
  [Bonus.DOUBLE_WORD]: "bg-yellow-200",
  [Bonus.TRIPLE_LETTER]: "bg-blue-600 text-white",
  [Bonus.TRIPLE_WORD]: "bg-red-600 text-white",
};

const bonusMessageMap: Record<Bonus, string[]> = {
  [Bonus.DOUBLE_LETTER]: ["Double", "Letter"],
  [Bonus.DOUBLE_WORD]: ["Double", "Word"],
  [Bonus.TRIPLE_LETTER]: ["Triple", "Letter"],
  [Bonus.TRIPLE_WORD]: ["Triple", "Word"],
};

interface BoardComponentProps {
  clickToSelectHandlers: ReturnType<typeof useClickToSelect>;
}

export const BoardComponent = ({
  clickToSelectHandlers,
}: BoardComponentProps) => {
  // Context
  const { state, template, localProposedMove } = useGameContext();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Render
  if (!template || !state) return null;

  const { board, currentProposedMove } = state;

  // Determine which proposed move to show score for
  const activeProposedMove =
    localProposedMove.length > 0
      ? localProposedMove
      : currentProposedMove?.move;

  const showWaitingForPlayers =
    !state.gameStarted && state.playerIds.filter(Boolean).length === 1;

  return (
    <div className="flex justify-center items-center relative">
      {showWaitingForPlayers && (
        <OverlayWithLoader>
          <div className="text-2xl font-semibold">{t("lobby.loadingGames")}</div>
        </OverlayWithLoader>
      )}
      <div className="flex justify-center items-center p-8 rounded-xl bg-green-200 border-green-400 border-1">
        <div className="relative">
          <div className="grid grid-cols-15 gap-0 w-[720px]">
            {board.map((row, yIndex) =>
              row.map(({ tile, bonus }, xIndex) => {
                const key = `${xIndex}-${yIndex}`;

                // Check whether it's a proposed move
                const proposedMove: Move | undefined = (
                  localProposedMove.length > 0
                    ? localProposedMove
                    : currentProposedMove?.move
                )?.find((m) => m.x === xIndex && m.y === yIndex);

                const letter = proposedMove?.letter ?? tile?.letter;

                const squareColor = bonus
                  ? bonusColorMap[bonus]
                  : "bg-green-600";

                // Empty square
                if (!letter) {
                  const isEmptySquareSelected =
                    clickToSelectHandlers.isSelected("board", xIndex, yIndex);

                  return (
                    <DroppableBoardSquare
                      key={key}
                      x={xIndex}
                      y={yIndex}
                      squareColor={squareColor}
                      onClick={() =>
                        clickToSelectHandlers.handleBoardSquareClick(
                          xIndex,
                          yIndex
                        )
                      }
                      isSelected={isEmptySquareSelected}
                    >
                      <div className="text-[10px] flex flex-col items-center justify-center h-full select-none">
                        {bonus &&
                          bonusMessageMap[bonus].map((v, i) => (
                            <p key={i}>{v}</p>
                          ))}
                      </div>
                    </DroppableBoardSquare>
                  );
                }

                // Tile
                const isSelected = clickToSelectHandlers.isSelected(
                  "board",
                  xIndex,
                  yIndex
                );

                return (
                  <DroppableBoardSquare
                    key={key}
                    x={xIndex}
                    y={yIndex}
                    squareColor={squareColor}
                    onClick={() => {}}
                  >
                    {proposedMove ? (
                      <DraggableBoardTile
                        letter={letter}
                        x={xIndex}
                        y={yIndex}
                        isSelected={isSelected}
                        onClick={() =>
                          clickToSelectHandlers.handleTileClick({
                            letter,
                            source: "board",
                            x: xIndex,
                            y: yIndex,
                          })
                        }
                      />
                    ) : (
                      <TileComponent letter={letter} proposedMove={false} />
                    )}
                  </DroppableBoardSquare>
                );
              })
            )}
          </div>

          {/* Score indicator overlay */}
          {activeProposedMove && activeProposedMove.length > 0 && user && (
            <ProposedMoveScoreIndicator
              proposedMove={activeProposedMove}
              playerId={user.uid}
            />
          )}
        </div>
      </div>
    </div>
  );
};
