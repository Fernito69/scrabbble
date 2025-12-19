import { OverlayWithLoader } from "@/components/OverlayWithLoader/OverlayWithLoader";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { Bonus, Move } from "@/model/core.model";
import { isMoveValid } from "@/services/collections/game/game.utils";
import { useGetPlayerName } from "@/services/collections/userConfig/userConfig.hooks";
import { useTranslation } from "react-i18next";
import { DraggableBoardTile } from "../TileComponent/DraggableBoardTile";
import { TileComponent } from "../TileComponent/TileComponent";
import { useClickToSelect } from "../useClickToSelect.hook";
import { DroppableBoardSquare } from "./DroppableBoardSquare";
import { ProposedMoveScoreIndicator } from "./ProposedMoveScoreIndicator";

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
  const getUserName = useGetPlayerName();

  // Render
  if (!template || !state) return null;

  const { board, currentProposedMove, gameOver } = state;

  // Determine which proposed move to show score for
  const activeProposedMove =
    localProposedMove.length > 0
      ? localProposedMove
      : currentProposedMove?.move;

  const showWaitingForPlayers =
    !state.gameStarted && state.playerIds.filter(Boolean).length === 1;

  const res: [string | undefined, number | undefined] | undefined = gameOver
    ? Object.entries(state.score.total).sort(
        ([_, score1], [, score2]) => score2 - score1
      )[0]
    : undefined;

  const [winningPlayerId, winningScore] = res ?? [undefined, undefined];

  return (
    <div className="flex justify-center items-center relative min-h-[200px]">
      {showWaitingForPlayers && (
        <OverlayWithLoader>
          <div className="text-2xl font-semibold">
            {t("lobby.waitingForPlayers")}
          </div>
        </OverlayWithLoader>
      )}
      {gameOver && winningPlayerId != null && (
        <OverlayWithLoader>
          <div className="text-2xl font-semibold">{t("lobby.gameOver")}</div>
          <div className="text-xl font-semibold flex flex-row gap-2 items-center">
            {t("lobby.winningPlayer")}:
            <UserAvatar
              userId={winningPlayerId}
              diameter={24}
              shadingIndex={state.playerIds.indexOf(winningPlayerId)}
            />
            <div className="font-bold">{getUserName(winningPlayerId)}</div>
          </div>
          <div className="relative mt-2">
            {/* Outer rainbow spinning glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-yellow-600 via-green-600 via-blue-600 via-purple-600 to-red-600 rounded-xl blur-md opacity-75 animate-spin bg-[length:400%_400%] animate-gradient"></div>

            {/* Main container */}
            <div className="relative text-xl font-semibold flex flex-row items-center gap-2 px-8 py-4 rounded-lg overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 via-red-600 to-orange-600 bg-[length:400%_400%] animate-gradient border-4 border-yellow-300 animate-glow">
              {/* Rotating background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 via-pink-500 via-purple-500 to-yellow-400 opacity-50 blur-sm animate-spin bg-[length:400%_400%]"></div>

              {/* Pinging effect */}
              <div className="absolute inset-0 animate-ping bg-yellow-300 rounded-lg opacity-10"></div>

              {/* Pulsing gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white to-transparent opacity-20 animate-pulse"></div>

              {/* Content */}
              <div className="relative z-10 flex items-center gap-3">
                <span className="animate-bounce text-yellow-300 text-3xl drop-shadow-[0_0_15px_rgba(255,255,0,1)] filter brightness-150">
                  ⭐
                </span>
                <span className="text-white font-extrabold text-2xl drop-shadow-[0_0_15px_rgba(255,255,255,1)] animate-pulse tracking-wide">
                  {t("lobby.winningScore")}:
                </span>
                <span className="font-black text-5xl drop-shadow-[0_0_25px_rgba(255,255,0,1)] animate-bounce bg-gradient-to-r from-yellow-200 via-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient filter brightness-150 scale-110">
                  {winningScore}
                </span>
                <span className="animate-bounce text-yellow-300 text-3xl drop-shadow-[0_0_15px_rgba(255,255,0,1)] filter brightness-150">
                  ⭐
                </span>
              </div>

              {/* Corner sparkles */}
              <div className="absolute top-0 left-0 w-4 h-4 bg-white rounded-full blur-sm animate-ping"></div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-white rounded-full blur-sm animate-ping" style={{ animationDelay: "0.5s" }}></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-white rounded-full blur-sm animate-ping" style={{ animationDelay: "1s" }}></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full blur-sm animate-ping" style={{ animationDelay: "1.5s" }}></div>
            </div>
          </div>
        </OverlayWithLoader>
      )}
      <div className="flex justify-center items-center p-4 rounded-xl bg-green-700 border-green-400 border-1">
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
                const wildcardValue =
                  proposedMove?.collapsedWildcard || tile?.collapsedWildcard;

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
                        wildcardValue={wildcardValue}
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
                      <TileComponent
                        letter={letter}
                        isProposedMove={false}
                        wildcardValue={wildcardValue}
                      />
                    )}
                  </DroppableBoardSquare>
                );
              })
            )}
          </div>

          {/* Score indicator overlay */}
          {activeProposedMove &&
            activeProposedMove.length > 0 &&
            user &&
            isMoveValid(activeProposedMove, state.currentTurn).valid && (
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
