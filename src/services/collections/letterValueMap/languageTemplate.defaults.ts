import { SPANISH_LETTER_VALUE_MAP } from "@/model/core.defaults";
import { LanguageTemplate } from "./languageTemplate.model";

export const LANGUAGE_TEMPLATE_COLLECTION = "languageTemplate" as const;

export const DEFAULT_LANGUAGE_TEMPLATE: LanguageTemplate = {
  createdByUserId: "system",
  createdAt: new Date(),
  name: "Spanish",
  description: "Spanish language template",
  letterValueMap: SPANISH_LETTER_VALUE_MAP,
};
