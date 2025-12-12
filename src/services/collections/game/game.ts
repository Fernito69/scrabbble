import { DEFAULT_GAME_STATE } from "@/model/core.defaults";
import { GameState } from "@/model/core.model";
import {
  Firestore,
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import { GAME_COLLECTION } from "./game.defaults";
import { mapDbGamePayloadToGameState } from "./game.mappers";
import { DbGamePayload } from "./game.model";
import { computeTilePouch } from "./game.utils";

export const createGame = async (
  db: Firestore,
  userId: string,
  template: LanguageTemplate
): Promise<string> => {
  const { playerIds, score, gameStarted, gameOver, currentTurn, board } =
    DEFAULT_GAME_STATE;

  const payload = {
    createdByUserId: userId,
    createdAt: new Date(),
    template,
    playerIds,
    currentPlayerId: null,
    currentProposedMove: null,
    currentVote: null,
    score,
    gameStarted,
    currentTurn,
    gameOver,
    board: JSON.stringify(board),
    tilePouch: computeTilePouch(template.quantityMap),
    playerHands: {},
  } satisfies DbGamePayload;

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