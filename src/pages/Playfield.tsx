import { Switch } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import {
  useGetUserConfig,
  useUpdateUserConfig,
} from "@/services/collections/userConfig/userConfig.hook";
import { useNavigate } from "react-router-dom";

export const Playfield = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const handleUpdateTheme = async () => {
    try {
      const theme =
        !userConfig?.theme || userConfig.theme === "light" ? "dark" : "light";
      await updateUserConfig({ ...userConfig, theme });
    } catch (err) {
      console.error("Failed to update user config:", err);
    }
  };

  const userConfig = useGetUserConfig();
  const updateUserConfig = useUpdateUserConfig();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Playfield</h1>
            <p className="text-muted-foreground mt-1">Welcome, {user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm border border-input rounded-md hover:bg-accent"
          >
            Sign Out
          </button>
          <Switch
            checked={userConfig?.theme === "dark"}
            onCheckedChange={handleUpdateTheme}
          />
          CURRENT USER CONFIG: {JSON.stringify(userConfig, null, 2)}
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground text-lg">
            Game board will be here
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            This is a placeholder for the Playfield component
          </p>
        </div>
      </div>
    </div>
  );
};
