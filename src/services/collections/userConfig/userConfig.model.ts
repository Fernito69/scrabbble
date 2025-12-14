import { Language } from "../letterValueMap/languageTemplate.model";

export type UserConfigBase = {
  displayName?: string;
  email?: string;
  language?: Language;
  photoURL?: string;
};

export type UserConfig = UserConfigBase & {
  id: string;
};
