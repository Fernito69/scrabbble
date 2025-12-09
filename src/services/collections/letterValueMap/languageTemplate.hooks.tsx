import { db } from "@/config/firebase";
import { useEffect, useState } from "react";
import { getLanguageTemplatesSnapshot } from "./languageTemplate";
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
