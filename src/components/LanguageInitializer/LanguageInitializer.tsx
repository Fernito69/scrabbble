import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserConfig } from "@/services/collections/userConfig/userConfig.hooks";
import { Language } from "@/services/collections/letterValueMap/languageTemplate.model";

interface Props {
  children: React.ReactNode;
}

export const LanguageInitializer = ({ children }: Props) => {
  const { i18n } = useTranslation();
  const { loading: authLoading, user } = useAuth();
  const userConfig = useGetUserConfig();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Wait for auth to complete before initializing
    if (authLoading) {
      return;
    }

    // If there's no user (logged out), just set default
    if (!user && !hasInitialized.current) {
      i18n.changeLanguage(Language.EN);
      hasInitialized.current = true;
      return;
    }

    // If user is logged in, wait for userConfig to load (or fail to load)
    // Only initialize once we have actual data OR confirmed it doesn't exist
    if (user && !hasInitialized.current) {
      if (userConfig) {
        // We have the config, use the saved language
        const savedLanguage = userConfig.language ?? Language.EN;
        i18n.changeLanguage(savedLanguage);
        hasInitialized.current = true;
      }
    }
  }, [authLoading, user, userConfig, i18n]);

  return <>{children}</>;
};
