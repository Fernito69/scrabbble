import { GameState } from "@/model/core.model";
import {
  Firestore,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  DEFAULT_USER_CONFIG,
  USER_CONFIG_COLLECTION,
} from "./userConfig.defaults";
import { UserConfig } from "./userConfig.model";

export const getUserConfigsSnapshot = async (
  db: Firestore,
  playerIds: GameState["playerIds"],
  callback: (data: UserConfig[]) => void
) => {
  const q = query(
    collection(db, USER_CONFIG_COLLECTION),
    where("id", "in", playerIds)
  );

  const unsubscribe = onSnapshot(q, {
    next: (collSnap) => {
      const data = collSnap.docs.map((d) => d.data() as UserConfig);
      callback(data);
    },
  });

  return unsubscribe;
};

export const getUserConfig = async (
  db: Firestore,
  userId: string
): Promise<UserConfig | null> => {
  const docRef = doc(db, USER_CONFIG_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserConfig;
  }

  return null;
};

export const updateUserConfig = async (
  db: Firestore,
  userId: string,
  userConfig: Partial<UserConfig>
): Promise<void> => {
  const docRef = doc(db, USER_CONFIG_COLLECTION, userId);
  await updateDoc(docRef, userConfig);
};

export const initUserConfig = async (
  db: Firestore,
  userId: string
): Promise<void> => {
  const docRef = doc(db, USER_CONFIG_COLLECTION, userId);

  if ((await getDoc(docRef)).exists()) {
    return;
  }

  await setDoc(docRef, {
    ...DEFAULT_USER_CONFIG,
    id: userId,
  } satisfies UserConfig);

  console.log("Initialized user config for user", userId);
};
