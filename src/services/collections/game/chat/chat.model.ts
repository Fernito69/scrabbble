import { Timestamp } from "../game.model";

export type ChatMessageBase = {
  // typeof text == "number" for turn messages
  // typeof text == "string" for other messages
  text: string | number;
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
