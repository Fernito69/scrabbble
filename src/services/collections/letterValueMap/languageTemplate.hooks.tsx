import { db } from "@/config/firebase";
import { useEffect, useState } from "react";
import {
  getDefaultLanguageTemplateSnapshot,
  getLanguageTemplatesSnapshot,
} from "./languageTemplate";
import { LanguageTemplate } from "./languageTemplate.model";

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
  >();

  useEffect(
    () =>
      getDefaultLanguageTemplateSnapshot(db, (d) =>
        setLanguageTemplate(d ?? undefined)
      ),
    []
  );

  return languageTemplate;
};
