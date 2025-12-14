import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import { cn } from "@/lib/utils";
import { VoteType } from "@/model/core.model";
import { useGetUserConfig } from "@/services/collections/userConfig/userConfig.hooks";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { BoardComponent } from "./BoardComponent/BoardComponent";
import { PlayerHand } from "./PlayerHand/PlayerHand";
import { usePlayfieldHandlers } from "./PlayfieldContainer.hooks";
import { ScoreBoard } from "./ScoreBoard/ScoreBoard";
import { TileComponent } from "./TileComponent/TileComponent";
import { ReshuffleVoteModal } from "./VoteModals/ReshuffleVoteModal/ReshuffleVoteModal";
import { UserAvatar } from "@/components/UserAvatar";

export const PlayfieldContainer = () => {
  // Hooks
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state, template } = useGameContext();

  const {
    sensors,
    handleDragStart,
    handleDragEnd,
    handleSignOut,
    handleLeave,
    handleInvitePlayers,
    activeLetter,
  } = usePlayfieldHandlers();

  // Data
  const userConfig = useGetUserConfig();

  if (!state) return null;

  // Consts
  const userName = userConfig?.displayName ?? user?.email;
  const showReshuffleModal =
    state.currentVote?.type === VoteType.RESHUFFLE &&
    !state.currentVote?.voteFinished &&
    state.playerIds.filter(Boolean).length > 1;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold">scrabbbbbble</h1>
              <p className="text-muted-foreground mt-1">
                {t("playfield.welcome", { userName })}
              </p>
            </div>
            <div className="flex gap-4 items-center">
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
                className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
              >
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
                className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
              >
                {t("playfield.signOut")}
              </button>
              <UserAvatar userId={user!.uid} diameter={24} />
            </div>
          </div>

          <div id="badges" className="rounded-lg text-center p-2">
            <div className="flex flex-row flex-wrap gap-2 mb-4 items-center">
              <Badge
                label={t("playfield.players")}
                value={
                  <div className="flex flex-row gap-2 ">
                    {(state.playerIds ?? []).filter(Boolean).map((v, i) => (
                      <UserAvatar
                        key={v}
                        userId={v!}
                        diameter={24}
                        shadingIndex={i}
                      />
                    ))}
                  </div>
                }
              />
              {template && (
                <Badge label={t("playfield.language")} value={template.name} />
              )}
              {state.gameStarted && (
                <>
                  <Badge
                    label={t("playfield.turn")}
                    value={state.currentTurn}
                  />
                  {state.currentPlayerId != null && (
                    <Badge
                      label={t("playfield.currentMove")}
                      value={
                        <UserAvatar
                          userId={state.currentPlayerId}
                          glow={state.currentPlayerId === user!.uid}
                          diameter={24}
                        />
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
            <BoardComponent />
          </div>
          {showReshuffleModal && (
            <ReshuffleVoteModal vote={state!.currentVote!} />
          )}
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col justify-between items-center mb-8 gap-4">
            <PlayerHand />
            <ScoreBoard />
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
