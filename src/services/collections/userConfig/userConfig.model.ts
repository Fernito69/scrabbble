import { Language } from "../letterValueMap/languageTemplate.model";

export type UserConfigBase = {
  displayName?: string;
  email?: string;
  language?: Language;
  photoURL?: string;
  isAdmin?: boolean;
  rankingCollapsed?: boolean;
  currentTab?: string;
  showTilePlayerColors?: boolean;
};

export type UserConfig = UserConfigBase & {
  id: string;
};
