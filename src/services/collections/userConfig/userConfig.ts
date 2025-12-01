import { Firestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { UserConfig } from "./userConfig.model";
import {
  DEFAULT_USER_CONFIG,
  USER_CONFIG_COLLECTION,
} from "./userConfig.defaults";

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
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return;
  }

  await setDoc(docRef, DEFAULT_USER_CONFIG);
  console.log("Initialized user config for user", userId);
};
