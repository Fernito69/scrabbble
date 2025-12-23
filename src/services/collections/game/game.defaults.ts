import { Language } from "../letterValueMap/languageTemplate.model";

export const GAME_COLLECTION = "games";

export const LANGUAGES = [
  { code: Language.EN, label: "🇬🇧/🇺🇸" },
  { code: Language.ES, label: "🇪🇸" },
  { code: Language.CL, label: "🇨🇱" },
] as const;
