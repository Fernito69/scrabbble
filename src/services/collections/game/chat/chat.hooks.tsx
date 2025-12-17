import { db } from "@/config/firebase";
import { useEffect, useState } from "react";
import { addChatMessage, getLastNChatMessagesSnapshot } from "./chat";
import { ChatMessage, ChatMessageBase } from "./chat.model";

export const useGetLastNPlayerGames = (
  gameId: string,
  limit: number = 10
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
    []
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
