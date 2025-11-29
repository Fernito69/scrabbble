import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { authService } from "../../auth";
import { db } from "@/config/firebase";
import { USER_CONFIG_COLLECTION } from "./userConfig";
import { UserConfig } from "./userConfig.model";
import { useEffect, useState } from "react";

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
          console.log("fetching user config", data);
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
