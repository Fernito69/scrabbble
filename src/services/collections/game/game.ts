import { GameState, Move, PlayerHand } from "@/model/core.model";
import { User } from "firebase/auth";
import {
  Firestore,
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import { GAME_COLLECTION } from "./game.defaults";
import { mapDbGamePayloadToGameState } from "./game.mappers";
import { DbGamePayload } from "./game.model";
import { buildProposeMovePayload, getInitialGamePayload } from "./game.utils";

export const createGame = async (
  db: Firestore,
  userId: string,
  template: LanguageTemplate
): Promise<string> => {
  const payload = getInitialGamePayload(userId, template);

  const docRef = await addDoc(collection(db, GAME_COLLECTION), payload);
  return docRef.id;
};

export const getGameSnapshot = (
  db: Firestore,
  id: string,
  callback: (
    state: GameState,
    template: LanguageTemplate,
    createdByUserId: string
  ) => void
) => {
  const docRef = doc(db, GAME_COLLECTION, id);

  const unsubscribe = onSnapshot(docRef, {
    next: (docSnap) => {
      const res = docSnap.data() as DbGamePayload;

      // Convert state
      const state = mapDbGamePayloadToGameState(res);

      callback(state, res.template, res.createdByUserId);
    },
  });

  return unsubscribe;
};

export const updateGame = (
  db: Firestore,
  id: string,
  game: Partial<DbGamePayload>
) => {
  const docRef = doc(db, GAME_COLLECTION, id);
  return updateDoc(docRef, game);
};

// TODO: move skip turn and propose move handlers to here

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
    ...getInitialGamePayload(currState.playerIds[0]!, currTemplate),
    currentVote: null,
  } satisfies Partial<DbGamePayload>;

  await updateGame(db, gameId, payload);
};

export const getLastNPlayerGamesSnapshot = (
  db: Firestore,
  userId: string,
  n: number,
  callback: (data: (GameState & { id: string })[]) => void,
  errorCallback: (err: string) => void
) => {
  const q = query(
    collection(db, GAME_COLLECTION),
    where("playerIds", "array-contains", userId),
    where("gameOver", "==", false),
    limit(n)
  );

  const unsubscribe = onSnapshot(q, {
    next: (collSnap) => {
      const data = collSnap.docs.map((d) => ({
        ...mapDbGamePayloadToGameState(d.data() as DbGamePayload),
        id: d.id,
      }));
      callback(data);
    },
    error: (err) => errorCallback(err.message),
  });

  return unsubscribe;
};
