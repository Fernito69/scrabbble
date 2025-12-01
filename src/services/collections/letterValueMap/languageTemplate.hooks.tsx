import { db } from "@/config/firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { LANGUAGE_TEMPLATE_COLLECTION } from "./languageTemplate.defaults";
import { LanguageTemplate } from "./languageTemplate.model";

export const useGetLanguageTemplates = (): LanguageTemplate[] => {
  const [languageTemplates, setLanguageTemplates] = useState<
    LanguageTemplate[]
  >([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, LANGUAGE_TEMPLATE_COLLECTION),
      {
        next: (collSnap) => {
          const data = collSnap.docs.map((d) => d.data() as LanguageTemplate);
          setLanguageTemplates(data);
        },
      }
    );

    return unsubscribe;
  }, []);

  return languageTemplates;
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
