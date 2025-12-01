import {
  Firestore,
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  DEFAULT_LANGUAGE_TEMPLATE,
  LANGUAGE_TEMPLATE_COLLECTION,
} from "./languageTemplate.defaults";
import { LanguageTemplate } from "./languageTemplate.model";

export const getLanguageTemplates = async (
  db: Firestore
): Promise<LanguageTemplate[]> => {
  const colRef = collection(db, LANGUAGE_TEMPLATE_COLLECTION);
  const docSnap = await getDocs(colRef);

  return docSnap.docs.map((doc) => doc.data() as LanguageTemplate);
};

export const updateLanguageTemplate = async (
  db: Firestore,
  docId: string,
  languageTemplate: Partial<LanguageTemplate>
): Promise<void> => {
  const docRef = doc(db, LANGUAGE_TEMPLATE_COLLECTION, docId);
  await updateDoc(docRef, languageTemplate);
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
