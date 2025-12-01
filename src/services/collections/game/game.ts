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
import { DEFAULT_LANGUAGE_TEMPLATE } from "../letterValueMap/languageTemplate.defaults";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import { GAME_COLLECTION } from "./game.defaults";
import { DbGame, DbGamePayload } from "./game.model";
import { cloneDeep } from "lodash";

export const createGame = async (
  db: Firestore,
  userId: string
): Promise<string> => {
  const payload = {
    createdByUserId: userId,
    createdAt: new Date(),
    state: JSON.stringify(DEFAULT_GAME_STATE),
    template: JSON.stringify(DEFAULT_LANGUAGE_TEMPLATE),
  } satisfies DbGamePayload;

  const docRef = await addDoc(collection(db, GAME_COLLECTION), payload);
  return docRef.id;
};

export const getGameSnapshot = (
  db: Firestore,
  id: string,
  callback: (data: DbGame) => void
) => {
  const docRef = doc(db, GAME_COLLECTION, id);
  const unsubscribe = onSnapshot(docRef, {
    next: (docSnap) => {
      const res = docSnap.data() as DbGamePayload;
      // Convert
      const data = {
        ...cloneDeep(res),
        state: JSON.parse(res.state) as GameState,
        template: JSON.parse(res.template) as LanguageTemplate,
      } satisfies DbGame;

      callback(data);
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
