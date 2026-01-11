import { Language } from "../letterValueMap/languageTemplate.model";

export const GAME_COLLECTION = "games";

export const LANGUAGES = [
  { code: Language.EN, label: "🇬🇧/🇺🇸" },
  { code: Language.ES, label: "🇪🇸" },
  { code: Language.CL, label: "🇨🇱" },
] as const;

export const PLAYER_COLORS = [
  // player 1
  {
    badgeBg: "bg-blue-300",
    tile: {
      bg: "bg-blue-50",
      border:
        "border-r-blue-500 border-t-blue-500 border-l-blue-400 border-b-blue-400",
      text: "text-blue-600",
    },
    glowColor: "96, 165, 250",
  },
  // player 2
  {
    badgeBg: "bg-red-300",
    tile: {
      bg: "bg-red-50",
      border:
        "border-r-red-500 border-t-red-500 border-l-red-400 border-b-red-400",
      text: "text-red-600",
    },
    glowColor: "248, 113, 113",
  },
  // player 31
  {
    badgeBg: "bg-yellow-300",
    tile: {
      bg: "bg-yellow-50",
      border:
        "border-r-yellow-500 border-t-yellow-500 border-l-yellow-400 border-b-yellow-400",
      text: "text-yellow-600",
    },
    glowColor: "250, 204, 21",
  },
  // player 4
  {
    badgeBg: "bg-purple-300",
    tile: {
      bg: "bg-purple-50",
      border:
        "border-r-purple-500 border-t-purple-500 border-l-purple-400 border-b-purple-400",
      text: "text-purple-600",
    },
    glowColor: "189, 36, 255",
  },
] as const;
