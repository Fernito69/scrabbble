import {
  ENGLISH_LETTER_QUANTITY_MAP,
  ENGLISH_SCORE_MAP,
  GERMAN_LETTER_QUANTITY_MAP,
  GERMAN_SCORE_MAP,
  SPANISH_LETTER_QUANTITY_MAP,
  SPANISH_SCORE_MAP,
} from "@/model/core.defaults";
import { LanguageTemplate } from "./languageTemplate.model";

export const LANGUAGE_TEMPLATE_COLLECTION = "languageTemplate" as const;

export const SPANISH_LANGUAGE_TEMPLATE: LanguageTemplate = {
  createdByUserId: "system",
  createdAt: new Date(),
  name: "Español 🇪🇸",
  description: "Spanish language template",
  scoreMap: SPANISH_SCORE_MAP,
  quantityMap: SPANISH_LETTER_QUANTITY_MAP,
};

export const GERMAN_LANGUAGE_TEMPLATE: LanguageTemplate = {
  createdByUserId: "system",
  createdAt: new Date(),
  name: "Deutsch 🇩🇪",
  description: "German language template",
  scoreMap: GERMAN_SCORE_MAP,
  quantityMap: GERMAN_LETTER_QUANTITY_MAP,
};

export const ENGLISH_LANGUAGE_TEMPLATE: LanguageTemplate = {
  createdByUserId: "system",
  createdAt: new Date(),
  name: "English 🇬🇧/🇺🇸",
  description: "English language template",
  scoreMap: ENGLISH_SCORE_MAP,
  quantityMap: ENGLISH_LETTER_QUANTITY_MAP,
};
