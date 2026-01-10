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
    badgeBg: "bg-red-300",
    tile: {
      bg: "bg-red-50",
      border: "border-red-400",
      text: "text-red-600",
    },
  },
  // player 2
  {
    badgeBg: "bg-green-300",
    tile: {
      bg: "bg-green-50",
      border: "border-green-400",
      text: "text-green-600",
    },
  },
  // player 3
  {
    badgeBg: "bg-blue-300",
    tile: {
      bg: "bg-blue-50",
      border: "border-blue-400",
      text: "text-blue-600",
    },
  },
  // player 4
  {
    badgeBg: "bg-yellow-300",
    tile: {
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      text: "text-yellow-600",
    },
  },
] as const;
