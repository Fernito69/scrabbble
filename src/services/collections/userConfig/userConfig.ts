import {
  Firestore,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
} from "firebase/firestore";
import {
  DEFAULT_USER_CONFIG,
  USER_CONFIG_COLLECTION,
} from "./userConfig.defaults";
import { UserConfig } from "./userConfig.model";
import { User } from "firebase/auth";

// This will explode eventually, optimize it later
export const getUserConfigsSnapshot = (
  db: Firestore,
  callback: (data: UserConfig[]) => void
) => {
  const q = query(collection(db, USER_CONFIG_COLLECTION));

  const unsubscribe = onSnapshot(q, {
    next: (collSnap) => {
      const data = collSnap.docs.map((d) => d.data() as UserConfig);
      callback(data);
    },
  });

  return unsubscribe;
};

export const getUserConfigSnapshot = (
  db: Firestore,
  userId: string,
  callback: (data: UserConfig | null) => void
) => {
  const userRef = doc(db, USER_CONFIG_COLLECTION, userId);

  const unsubscribe = onSnapshot(userRef, {
    next: (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserConfig;
        callback(data);
      } else {
        callback(null);
      }
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
  // Use setDoc with merge to create document if it doesn't exist
  await setDoc(docRef, userConfig, { merge: true });
};

export const initUserConfig = async (
  db: Firestore,
  user: User | null
): Promise<void> => {
  if (!user) return;

  const docRef = doc(db, USER_CONFIG_COLLECTION, user.uid);

  if ((await getDoc(docRef)).exists()) {
    return;
  }

  await setDoc(docRef, {
    ...DEFAULT_USER_CONFIG,
    id: user.uid,
    displayName: user.displayName ?? undefined,
    email: user.email ?? undefined,
  } satisfies UserConfig);

  console.log("Initialized user config for user", user.uid);
};
