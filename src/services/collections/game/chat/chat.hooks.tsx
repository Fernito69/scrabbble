import { db } from "@/config/firebase";
import { useEffect, useState } from "react";
import {
  addChatMessage,
  getLastNChatMessagesSnapshot,
  updateChatMessage,
} from "./chat";
import { ChatMessage, ChatMessageBase, ChatMessageDb } from "./chat.model";

export const useGetLastNChatMessages = (
  gameId: string,
  limit: number = 50
): {
  messages: ChatMessage[] | undefined;
  error: string | undefined;
} => {
  const [messages, setMessages] = useState<ChatMessage[] | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(
    () =>
      getLastNChatMessagesSnapshot(
        db,
        gameId,
        limit,
        (data) => {
          setMessages(data);
        },
        (err) => {
          setError(err);
        }
      ),
    [gameId, limit]
  );

  return { messages, error };
};

export const useAddMessage = (gameId: string) => {
  return async (message: ChatMessageBase): Promise<string> => {
    try {
      return addChatMessage(db, gameId, message);
    } catch (err) {
      console.error("Failed to add message:", err);
      throw err;
    }
  };
};

export const useUpdateMessage = (gameId: string) => {
  return async (
    message: Partial<ChatMessageDb>,
    id: string
  ): Promise<string> => {
    try {
      return updateChatMessage(db, gameId, id, message);
    } catch (err) {
      console.error("Failed to update message:", err);
      throw err;
    }
  };
};

// Backward compatibility
export const useGetLastNPlayerGames = useGetLastNChatMessages;
