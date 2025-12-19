import { Timestamp } from "../game.model";

export type ChatMessageBase = {
  text: string;
  playerId: string | undefined;
};

export interface ChatMessage extends ChatMessageBase {
  createdAt: Date;
  id: string;
}

export interface ChatMessageDb extends ChatMessageBase {
  createdAt: Timestamp;
}
