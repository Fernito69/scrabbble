import { Timestamp } from "../game.model";

export type ChatMessageBase = {
  text: string;
  playerId?: string;
  likes?: Record<string, boolean | undefined>;
};

export interface ChatMessage extends ChatMessageBase {
  createdAt: Date;
  id: string;
}

export interface ChatMessageDb extends ChatMessageBase {
  createdAt: Timestamp;
}
