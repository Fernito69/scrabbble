import { GameState } from "@/model/core.model";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";

export interface DbGame {
  createdByUserId: string;
  createdAt: Date;
  state: GameState;
  template: LanguageTemplate;
}

export interface DbGamePayload {
  createdByUserId: string;
  createdAt: Date;
  state: string;
  template: string;
}
