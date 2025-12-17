import { ChatMessage, ChatMessageDb } from "./chat.model";

export const mapDbChatMessageToApp = (
  dbMessage: ChatMessageDb,
  id: string
): ChatMessage => {
  return {
    ...dbMessage,
    id,
    createdAt: new Date(dbMessage.createdAt.seconds * 1000),
  } satisfies ChatMessage;
};
