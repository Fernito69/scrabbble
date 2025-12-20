import { db } from "@/config/firebase";
import { authService } from "@/services/auth";
import { initLanguageTemplate } from "@/services/collections/letterValueMap/languageTemplate";
import { initUserConfig } from "@/services/collections/userConfig/userConfig";
import { useGetUserConfig } from "@/services/collections/userConfig/userConfig.hooks";
import { User } from "firebase/auth";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const userConfig = useGetUserConfig();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      initUserConfig(db, user);
      initLanguageTemplate(db);
    }
  }, [user]);

  const isAdmin = userConfig?.isAdmin ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
