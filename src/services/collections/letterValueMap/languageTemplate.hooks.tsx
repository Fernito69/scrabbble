import { db } from "@/config/firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  DEFAULT_LANGUAGE_TEMPLATE,
  LANGUAGE_TEMPLATE_COLLECTION,
} from "./languageTemplate.defaults";
import { LanguageTemplate } from "./languageTemplate.model";
import { getLanguageTemplatesSnapshot } from "./languageTemplate";

const collectionRef = collection(db, LANGUAGE_TEMPLATE_COLLECTION);

export const useGetLanguageTemplates = (): LanguageTemplate[] => {
  const [languageTemplates, setLanguageTemplates] = useState<
    LanguageTemplate[]
  >([]);

  useEffect(
    () => getLanguageTemplatesSnapshot(db, (d) => setLanguageTemplates(d)),
    []
  );

  return languageTemplates;
};

export const useGetDefaultLanguageTemplate = ():
  | LanguageTemplate
  | undefined => {
  const [languageTemplate, setLanguageTemplate] = useState<
    LanguageTemplate | undefined
  >(undefined);

  useEffect(() => {
    const q = query(
      collectionRef,
      where("name", "==", DEFAULT_LANGUAGE_TEMPLATE.name)
    );

    const unsubscribe = onSnapshot(q, {
      next: (collSnap) => {
        const data = collSnap.docs.map((d) => d.data() as LanguageTemplate)[0];
        setLanguageTemplate(data);
      },
    });

    return unsubscribe;
  }, []);

  return languageTemplate;
};

export const useUpdateLanguageTemplate = (templateId: string) => {
  const docRef = doc(db, LANGUAGE_TEMPLATE_COLLECTION, templateId);

  return async (template: Partial<LanguageTemplate>) => {
    try {
      await updateDoc(docRef, template);
    } catch (err) {
      console.error("Failed to update language template:", err);
    }
  };
};
