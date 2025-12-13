import { LetterValueMap } from "@/model/core.model";

// For storing language templates for the game
export type LanguageTemplate = {
  createdByUserId: string;
  createdAt: Date;
  name: string;
  description?: string;
  scoreMap: LetterValueMap;
  quantityMap: LetterValueMap;
};

export enum Language {
  EN = "en",
  ES = "es",
}
