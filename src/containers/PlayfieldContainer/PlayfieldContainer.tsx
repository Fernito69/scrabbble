import { Chat } from "@/components/Chat/Chat";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { ScrabbbbbbleLogo } from "@/components/ScrabbbbbbleLogo/ScrabbbbbbleLogo";
import { UserAvatar } from "@/components/UserAvatar";
import { UserConfigPopover } from "@/components/UserConfigPopover/UserConfigPopover";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { VoteType } from "@/model/core.model";
import { useUpdateGame } from "@/services/collections/game/game.hooks";
import { getDefaultGameName } from "@/services/collections/game/game.utils";
import { useGetUserConfig } from "@/services/collections/userConfig/userConfig.hooks";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { ChevronLeft, Edit } from "lucide-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LanguageInfoModal } from "../LobbyContainer/LanguageSelectDialog/LanguageInfoModal/LanguageInfoModal";
import { BoardComponent } from "./BoardComponent/BoardComponent";
import { PlayerHand } from "./PlayerHand/PlayerHand";
import { usePlayfieldHandlers } from "./PlayfieldContainer.hooks";
import { ScoreBoard } from "./ScoreBoard/ScoreBoard";
import { TileComponent } from "./TileComponent/TileComponent";
import { useClickToSelect } from "./useClickToSelect.hook";
import { EndOfGameVoteModal } from "./VoteModals/EndOfGameVoteModal/EndOfGameVoteModal";
import { ReshuffleVoteModal } from "./VoteModals/ReshuffleVoteModal/ReshuffleVoteModal";
import { YourTurnMessage } from "./YourTurnMessage/YourTurnMessage";

export const PlayfieldContainer = () => {
  // Hooks
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state, template, isMyTurn } = useGameContext();

  const clickToSelectHandlers = useClickToSelect();

  const {
    sensors,
    handleDragStart,
    handleDragEnd,
    handleSignOut,
    handleLeave,
    handleInvitePlayers,
    activeLetter,
  } = usePlayfieldHandlers(clickToSelectHandlers.clearSelection);

  // Data
  const userConfig = useGetUserConfig();

  if (!state) return null;

  // Consts
  const userName = userConfig?.displayName ?? user?.email;
  const showReshuffleModal =
    state.currentVote?.type === VoteType.INITIAL_RESHUFFLE &&
    !state.currentVote?.voteFinished &&
    state.playerIds.filter(Boolean).length > 1;
  const showEndOfGameModal = state.currentVote?.type === VoteType.END_OF_GAME;
  const awaitingApproval =
    state?.currentVote?.type === VoteType.ACCEPT_PROPOSED_MOVE;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-row items-end gap-2 h-full pb-3">
              <div className="flex items-center mr-2">
                <ScrabbbbbbleLogo withLink />
              </div>
              <div className="text-blue-400">→</div>
              <div className="text-muted-foreground mt-1 h-full ">
                {t("playfield.welcome", { userName })}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {!state.gameStarted && (
                <button
                  onClick={handleLeave}
                  className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
                >
                  {t("playfield.leaveGame")}
                </button>
              )}
              <button
                onClick={() => navigate("/")}
                className="px-2 py-2 text-sm text-white border border-input rounded-md bg-primary hover:bg-primary/90 flex flex-row items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("playfield.backToHome")}
              </button>
              {!state.gameStarted && (
                <button
                  onClick={handleInvitePlayers}
                  className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
                >
                  {t("playfield.invitePlayers")}
                </button>
              )}
              <LanguageSwitcher />
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent mr-2"
              >
                {t("playfield.signOut")}
              </button>
              <UserConfigPopover />
            </div>
          </div>

          <div id="badges" className="rounded-lg text-center p-2">
            <div className="flex flex-row flex-wrap gap-2 mb-4 items-center">
              <Badge label={t("playfield.gameName")} value={<GameName />} />
              <Badge
                label={t("playfield.players")}
                value={
                  <div className="flex flex-row gap-2 ">
                    {(state.playerIds ?? []).filter(Boolean).map((v, i) => (
                      <UserAvatar
                        key={i}
                        userId={v!}
                        diameter={20}
                        shadingIndex={i}
                      />
                    ))}
                  </div>
                }
              />
              {template && (
                <Badge
                  label={t("playfield.language")}
                  value={
                    <div className="flex flex-row items-center gap-2">
                      {template.name}
                      <LanguageInfoModal template={template} small />
                    </div>
                  }
                />
              )}
              {state.gameStarted && !state.gameOver && (
                <>
                  <Badge
                    label={t("playfield.turn")}
                    value={state.currentTurn}
                  />
                  {state.currentPlayerId != null && (
                    <Badge
                      label={
                        awaitingApproval
                          ? t("playfield.awaitingApproval")
                          : t("playfield.currentMove")
                      }
                      value={
                        <div className="flex flex-row items-center justify-center gap-2">
                          {!state.currentVote && (
                            <UserAvatar
                              userId={state.currentPlayerId}
                              bounce={state.currentPlayerId === user!.uid}
                              diameter={24}
                              shadingIndex={state.playerIds.indexOf(
                                state.currentPlayerId!
                              )}
                            />
                          )}
                          {isMyTurn && !state.currentVote && (
                            <YourTurnMessage />
                          )}
                          {awaitingApproval &&
                            state.playerIds
                              .filter(
                                (id) =>
                                  id !== null &&
                                  id !== state.currentPlayerId &&
                                  state.currentVote?.votes.some(
                                    (v) => v.playerId === id && !v.voted
                                  )
                              )
                              .map((id, i) => (
                                <UserAvatar
                                  key={i}
                                  shadingIndex={state.playerIds.findIndex(
                                    (uid) => uid === id
                                  )}
                                  bounce
                                  userId={id!}
                                  diameter={24}
                                />
                              ))}
                        </div>
                      }
                    />
                  )}
                  <Badge
                    label={t("playfield.tilesLeft")}
                    value={state.tilePouch.length}
                  />
                </>
              )}
            </div>

            <div className="flex gap-4 justify-center items-start">
              <BoardComponent clickToSelectHandlers={clickToSelectHandlers} />
            </div>
          </div>
          {showReshuffleModal && (
            <ReshuffleVoteModal vote={state!.currentVote!} />
          )}
          {showEndOfGameModal && (
            <EndOfGameVoteModal vote={state!.currentVote!} />
          )}
        </div>
        <div className="max-w-7xl mx-auto">
          {!state.gameOver && (
            <div className="flex flex-col justify-between items-center mb-8 gap-4">
              <PlayerHand clickToSelectHandlers={clickToSelectHandlers} />
            </div>
          )}
          <div className="flex flex-row gap-2 w-full justify-center">
            <ScoreBoard />
            <Chat />
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeLetter ? <TileComponent letter={activeLetter} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

/**********/
interface BadgeProps {
  label: string;
  value: ReactNode;
  color?: string;
}
export const Badge = ({
  label,
  value,
  color = "border-green-300",
}: BadgeProps) => {
  const className = cn(
    "flex flex-row gap-2 border-2 rounded-md p-2 shadow text-muted-foreground text-sm w-fit items-center",
    color
  );

  return (
    <div className={className}>
      <b>{label}</b>
      <span>{value}</span>
    </div>
  );
};

/**********/

export const GameName = () => {
  const { state, gameId } = useGameContext();
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!state || !user) return null;

  const updateGame = useUpdateGame(gameId);

  const handleEditGameName = () => {
    // TODO: use a proper modal
    updateGame({
      gameName:
        prompt("Enter game name", state.gameName) ??
        state.gameName ??
        getDefaultGameName(t("languageSelect.gameNameDefault")),
    });
  };

  const allowEdit = state.createdByUserId === user.uid;

  return (
    <div className="text-md flex flex-row gap-2 items-center">
      {state.gameName}
      {allowEdit && (
        <Edit className="h-4 w-4 cursor-pointer" onClick={handleEditGameName} />
      )}
    </div>
  );
};
