import { LetterValueMap } from "@/model/core.model";
import { Timestamp } from "firebase/firestore";

// For storing language templates for the game
export type LanguageTemplate = {
  createdByUserId: string;
  createdAt: Date | Timestamp;
  name: string;
  description?: string;
  scoreMap: LetterValueMap;
  quantityMap: LetterValueMap;
};

export enum Language {
  EN = "en",
  ES = "es",
  CL = "cl",
}
