import { db } from "@/config/firebase";
import { useEffect, useState } from "react";
import {
  getLanguageTemplatesSnapshot,
  initLanguageTemplate,
} from "./languageTemplate";
import { LanguageTemplate } from "./languageTemplate.model";

export const useGetLanguageTemplates = (): LanguageTemplate[] => {
  const [languageTemplates, setLanguageTemplates] = useState<
    LanguageTemplate[] | null
  >(null);

  useEffect(
    () => getLanguageTemplatesSnapshot(db, (d) => setLanguageTemplates(d)),
    []
  );

  useEffect(() => {
    // Initialize language templates if they don't exist
    if (languageTemplates && languageTemplates.length === 0) {
      initLanguageTemplate(db);
    }
  }, [languageTemplates]);

  return languageTemplates ?? [];
};
