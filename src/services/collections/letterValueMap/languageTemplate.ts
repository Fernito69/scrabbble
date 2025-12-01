import {
  Firestore,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
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

const buildDefaultLanguageTemplateQuery = (db: Firestore) =>
  query(
    collection(db, LANGUAGE_TEMPLATE_COLLECTION),
    where("name", "==", DEFAULT_LANGUAGE_TEMPLATE.name)
  );

export const getDefaultLanguageTemplate = async (
  db: Firestore
): Promise<LanguageTemplate | null> => {
  const docSnap = await getDocs(buildDefaultLanguageTemplateQuery(db));

  if (docSnap.empty) {
    return null;
  }

  return docSnap.docs[0].data() as LanguageTemplate;
};

export const getDefaultLanguageTemplateSnapshot = (
  db: Firestore,
  callback: (data: LanguageTemplate | null) => void
) => {
  const unsubscribe = onSnapshot(buildDefaultLanguageTemplateQuery(db), {
    next: (collSnap) => {
      const data = collSnap.docs.map((d) => d.data() as LanguageTemplate)[0];
      callback(data);
    },
  });

  return unsubscribe;
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

export const initLanguageTemplate = async (
  db: Firestore
): Promise<string | undefined> => {
  const colRef = collection(db, LANGUAGE_TEMPLATE_COLLECTION);
  const docSnap = await getDocs(colRef);

  if (docSnap.docs.length > 0) {
    return;
  }

  const docRef = await addDoc(colRef, DEFAULT_LANGUAGE_TEMPLATE);
  console.log("Initialized language template");

  return docRef.id;
};
