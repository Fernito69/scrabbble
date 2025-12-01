import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { authService } from "../../auth";
import { db } from "@/config/firebase";
import { UserConfig } from "./userConfig.model";
import { useCallback, useEffect, useState } from "react";
import { USER_CONFIG_COLLECTION } from "./userConfig.defaults";
import { useGameContext } from "@/contexts/GameState.context";
import { getUserConfigsSnapshot } from "./userConfig";

export const useGetUserConfig = (): UserConfig | null => {
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();

    if (!user) {
      setUserConfig(null);
      return;
    }

    const userRef = doc(db, USER_CONFIG_COLLECTION, user.uid);

    const unsubscribe = onSnapshot(userRef, {
      next: (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserConfig;
          setUserConfig(data);
        } else {
          setUserConfig(null);
        }
      },
    });

    return unsubscribe;
  }, []);

  return userConfig;
};

export const useGetPlayerName = () => {
  const { state } = useGameContext();

  const [userConfigs, setUserConfigs] = useState<UserConfig[]>([]);

  useEffect(() => {
    if (!state) {
      return;
    }

    getUserConfigsSnapshot(db, state.playerIds, (data) => {
      setUserConfigs(data);
    });
  }, [state]);

  return useCallback(
    (id: string | null) =>
      userConfigs.find((v) => v.id === id)?.displayName ?? "Player",
    [userConfigs]
  );
};

export const useUpdateUserConfig = () => {
  const user = authService.getCurrentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const userRef = doc(db, USER_CONFIG_COLLECTION, user.uid);

  return async (userConfig: Partial<UserConfig>) => {
    try {
      await updateDoc(userRef, userConfig);
    } catch (err) {
      console.error("Failed to update user config:", err);
    }
  };
};
