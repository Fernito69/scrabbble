import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Language } from "@/services/collections/letterValueMap/languageTemplate.model";
import { useUpdateUserConfig } from "@/services/collections/userConfig/userConfig.hooks";

const LANGUAGES = [
  { code: Language.EN, label: "🇬🇧/🇺🇸" },
  { code: Language.ES, label: "🇪🇸" },
] as const;

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const updateUserConfig = useUpdateUserConfig();

  const handleLanguageChange = async (languageCode: string) => {
    const langCode = languageCode as Language;
    i18n.changeLanguage(langCode);
    await updateUserConfig({ language: langCode });
  };

  const selectedLanguageFLag = LANGUAGES.find(
    (l) => i18n.language.toLowerCase() === l.code
  )?.label;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="px-4 py-1 text-sm border border-input rounded-md hover:bg-accent flex items-center gap-2 text-xl">
          <Languages className="h-4 w-4" />
          {selectedLanguageFLag}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">
            {t("languageSwitcher.selectLanguage")}
          </h4>
          <div className="flex flex-col gap-2">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={i18n.language === lang.code ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleLanguageChange(lang.code)}
              >
                {t(lang.label)}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
