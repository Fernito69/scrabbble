import { GameState, Move, PlayerHand } from "@/model/core.model";
import { User } from "firebase/auth";
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import { addChatMessage } from "./chat/chat";
import { ChatMessageBase } from "./chat/chat.model";
import { GAME_COLLECTION } from "./game.defaults";
import { mapDbGamePayloadToGameState } from "./game.mappers";
import { DbGamePayload } from "./game.model";
import { buildProposeMovePayload, getInitialGamePayload } from "./game.utils";

export const createGame = async (
  db: Firestore,
  userId: string,
  template: LanguageTemplate,
  text: string,
  gameName?: string
): Promise<string> => {
  const payload = {
    ...getInitialGamePayload(userId, template),
    gameName,
  } satisfies Partial<DbGamePayload>;

  const docRef = await addDoc(collection(db, GAME_COLLECTION), payload);

  // Add welcome message
  await addChatMessage(db, docRef.id, {
    text,
  } satisfies ChatMessageBase);

  return docRef.id;
};

export const getGameSnapshot = (
  db: Firestore,
  id: string,
  callback: (
    state: GameState,
    template: LanguageTemplate,
    createdByUserId: string
  ) => void,
  hasErrorCallback: (hasErr: boolean) => void
) => {
  const docRef = doc(db, GAME_COLLECTION, id);

  const unsubscribe = onSnapshot(docRef, {
    next: (docSnap) => {
      const res = docSnap.data() as DbGamePayload | undefined;

      if (!res) return hasErrorCallback(true);

      // Convert state
      const state = mapDbGamePayloadToGameState(res);

      hasErrorCallback(false);
      callback(state, res.template, res.createdByUserId);
    },
    error: () => hasErrorCallback(true),
  });

  return unsubscribe;
};

export const updateGame = (
  db: Firestore,
  id: string,
  game: Partial<DbGamePayload>
) => {
  const docRef = doc(db, GAME_COLLECTION, id);
  return updateDoc(docRef, { ...game, lastModifiedAt: new Date() });
};

export const deleteGame = async (db: Firestore, id: string) => {
  const docRef = doc(db, GAME_COLLECTION, id);
  return deleteDoc(docRef);
};

export const proposeMove = async (
  db: Firestore,
  gameId: string,
  move: Move[],
  hand: PlayerHand,
  state: GameState,
  user: User | null
) => {
  const payload = buildProposeMovePayload(move, hand, state, user);
  await updateGame(db, gameId, payload);
};

export const reshuffleInitialPlayerHands = async (
  db: Firestore,
  gameId: string,
  currState: GameState,
  currTemplate: LanguageTemplate
) => {
  if (!currState) return;
  const payload = {
    ...getInitialGamePayload(currState.createdByUserId, currTemplate),
    gameName: currState.gameName,
    currentVote: null,
  } satisfies Partial<DbGamePayload>;

  await updateGame(db, gameId, payload);
};

type GetLastNPlayerGamesSnapshotCallback = (
  gameStates: (GameState & { id: string })[],
  templates: LanguageTemplate[]
) => void;

export const getLastNPlayerGamesSnapshot = (
  db: Firestore,
  userId: string,
  n: number,
  callback: GetLastNPlayerGamesSnapshotCallback,
  errorCallback: (err: string) => void
) => {
  const q = query(
    collection(db, GAME_COLLECTION),
    where("playerIds", "array-contains", userId),
    where("gameOver", "==", false),
    orderBy("lastModifiedAt", "desc"),
    limit(n)
  );

  const unsubscribe = onSnapshot(q, {
    next: (collSnap) => {
      const gameStates = collSnap.docs.map((d) => ({
        ...mapDbGamePayloadToGameState(d.data() as DbGamePayload),
        id: d.id,
      }));
      const templates = collSnap.docs.map(
        (d) => (d.data() as DbGamePayload).template
      );
      callback(gameStates, templates);
    },
    error: (err) => errorCallback(err.message),
  });

  return unsubscribe;
};

// TODO: refactor
// With query: Query<DocumentData, DocumentData> as parameter
export const getLastNPastGamesSnapshot = (
  db: Firestore,
  userId: string,
  n: number,
  callback: GetLastNPlayerGamesSnapshotCallback,
  errorCallback: (err: string) => void
) => {
  const q = query(
    collection(db, GAME_COLLECTION),
    where("playerIds", "array-contains", userId),
    where("gameOver", "==", true),
    orderBy("lastModifiedAt", "desc"),
    limit(n)
  );

  const unsubscribe = onSnapshot(q, {
    next: (collSnap) => {
      const games = collSnap.docs.map((d) => ({
        ...mapDbGamePayloadToGameState(d.data() as DbGamePayload),
        id: d.id,
      }));
      const templates = collSnap.docs.map(
        (d) => (d.data() as DbGamePayload).template
      );
      callback(games, templates);
    },
    error: (err) => errorCallback(err.message),
  });

  return unsubscribe;
};

export const getLastNGamesSnapshot = (
  db: Firestore,
  n: number,
  callback: GetLastNPlayerGamesSnapshotCallback,
  errorCallback: (err: string) => void
) => {
  const q = query(
    collection(db, GAME_COLLECTION),
    where("gameOver", "==", true),
    orderBy("lastModifiedAt", "desc"),
    limit(n)
  );

  const unsubscribe = onSnapshot(q, {
    next: (collSnap) => {
      const games = collSnap.docs.map((d) => ({
        ...mapDbGamePayloadToGameState(d.data() as DbGamePayload),
        id: d.id,
      }));
      const templates = collSnap.docs.map(
        (d) => (d.data() as DbGamePayload).template
      );
      callback(games, templates);
    },
    error: (err) => errorCallback(err.message),
  });

  return unsubscribe;
};
