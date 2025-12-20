import {
  addDoc,
  collection,
  doc,
  Firestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { GAME_COLLECTION } from "../game.defaults";
import { CHAT_COLLECTION } from "./chat.defaults";
import { mapDbChatMessageToApp } from "./chat.mappers";
import { ChatMessage, ChatMessageBase, ChatMessageDb } from "./chat.model";

export const getLastNChatMessagesSnapshot = (
  db: Firestore,
  gameId: string,
  n: number = 100,
  callback: (data: ChatMessage[]) => void,
  errorCallback: (err: string) => void
) => {
  const q = query(
    collection(db, GAME_COLLECTION, gameId, CHAT_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const unsubscribe = onSnapshot(q, {
    next: (collSnap) => {
      const data = collSnap.docs.map((d) =>
        mapDbChatMessageToApp(d.data() as ChatMessageDb, d.id)
      );
      callback(data);
    },
    error: (err) => errorCallback(err.message),
  });

  return unsubscribe;
};

export const addChatMessage = async (
  db: Firestore,
  gameId: string,
  message: ChatMessageBase
) => {
  const colRef = collection(db, GAME_COLLECTION, gameId, CHAT_COLLECTION);
  const docRef = await addDoc(colRef, { ...message, createdAt: new Date() });

  return docRef.id;
};

export const updateChatMessage = async (
  db: Firestore,
  gameId: string,
  id: string,
  message: Partial<ChatMessageDb>
) => {
  const docRef = doc(db, GAME_COLLECTION, gameId, CHAT_COLLECTION, id);
  await updateDoc(docRef, message);

  return docRef.id;
};
