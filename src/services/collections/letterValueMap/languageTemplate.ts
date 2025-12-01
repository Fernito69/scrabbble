import {
  Firestore,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import {
  DEFAULT_LANGUAGE_TEMPLATE,
  LANGUAGE_TEMPLATE_COLLECTION,
} from "./languageTemplate.defaults";
import { LanguageTemplate } from "./languageTemplate.model";

export const updateLanguageTemplate = async (
  db: Firestore,
  docId: string,
  languageTemplate: Partial<LanguageTemplate>
): Promise<void> => {
  const docRef = doc(db, LANGUAGE_TEMPLATE_COLLECTION, docId);
  await updateDoc(docRef, languageTemplate);
};

export const getLanguageTemplatesSnapshot = (
  db: Firestore,
  callback: (data: LanguageTemplate[]) => void
) => {
  const unsubscribe = onSnapshot(collection(db, LANGUAGE_TEMPLATE_COLLECTION), {
    next: (collSnap) => {
      const data = collSnap.docs.map((d) => d.data() as LanguageTemplate);
      callback(data);
    },
  });

  return unsubscribe;
};

export const initLanguageTemplate = async (db: Firestore): Promise<void> => {
  const colRef = collection(db, LANGUAGE_TEMPLATE_COLLECTION);
  const docSnap = await getDocs(colRef);

  if (docSnap.docs.length > 0) {
    return;
  }

  await addDoc(colRef, DEFAULT_LANGUAGE_TEMPLATE);
  console.log("Initialized language template");
};
