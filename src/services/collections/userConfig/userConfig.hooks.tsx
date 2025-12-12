import { db } from "@/config/firebase";
import { useCallback, useEffect, useState } from "react";
import { authService } from "../../auth";
import {
  getUserConfigSnapshot,
  getUserConfigsSnapshot,
  updateUserConfig,
} from "./userConfig";
import { UserConfig } from "./userConfig.model";

export const useGetUserConfig = (): UserConfig | null => {
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();

    if (!user) {
      setUserConfig(null);
      return;
    }

    return getUserConfigSnapshot(db, user.uid, (data) => {
      setUserConfig(data);
    });
  }, []);

  return userConfig;
};

export const useGetPlayerName = () => {
  const [userConfigs, setUserConfigs] = useState<UserConfig[]>([]);

  useEffect(
    () =>
      getUserConfigsSnapshot(db, (data) => {
        setUserConfigs(data);
      }),
    []
  );

  return useCallback(
    (id: string | null) =>
      userConfigs.find((v) => v.id === id)?.displayName ?? id,
    [userConfigs]
  );
};

export const useUpdateUserConfig = () => {
  const user = authService.getCurrentUser();

  if (!user) {
    throw new Error("User not found");
  }

  return async (userConfig: Partial<UserConfig>) => {
    try {
      await updateUserConfig(db, user.uid, userConfig);
    } catch (err) {
      console.error("Failed to update user config:", err);
    }
  };
};
