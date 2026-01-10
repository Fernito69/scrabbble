import { Language } from "../letterValueMap/languageTemplate.model";
import { UserConfigBase } from "./userConfig.model";

export const USER_CONFIG_COLLECTION = "userConfig" as const;

export const DEFAULT_USER_CONFIG: UserConfigBase = {
  language: Language.EN,
  showTilePlayerColors: true,
};
