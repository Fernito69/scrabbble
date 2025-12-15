import { OverlayWithLoader } from "@/components/OverlayWithLoader/OverlayWithLoader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateGame } from "@/services/collections/game/game.hooks";
import { getDefaultGameName } from "@/services/collections/game/game.utils";
import { useGetLanguageTemplates } from "@/services/collections/letterValueMap/languageTemplate.hooks";
import { LanguageTemplate } from "@/services/collections/letterValueMap/languageTemplate.model";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

interface Props {
  close: () => void;
}
export const LanguageSelectDialog = ({ close }: Props) => {
  // Hooks
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State & Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<
    LanguageTemplate | undefined
  >();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [gameName, setGameName] = useState<string | undefined>(
    getDefaultGameName(t("languageSelect.gameNameDefault"))
  );

  // Data
  const { user } = useAuth();
  const templates = useGetLanguageTemplates();
  const createGame = useCreateGame(gameName);

  if (!templates) return null;

  // Handlers
  const handleCreateGame = async () => {
    if (!user || !selectedTemplate) return;

    setIsCreating(true);
    try {
      await createGame(selectedTemplate, (gameId) =>
        navigate(`/game/${gameId}`)
      );
    } catch (error) {
      console.error("Failed to create game:", error);
      setIsCreating(false);
    } finally {
      close();
    }
  };

  // Consts
  const options = templates.map((template) => ({
    value: template.name,
    label: template.name,
    template,
  }));
  const selectedOption = options.find(
    (option) => option.value === selectedTemplate?.name
  );

  // Render
  return (
    <Dialog open onOpenChange={close}>
      <DialogContent>
        {isCreating && (
          <OverlayWithLoader>
            <p className="text-sm text-muted-foreground">
              {t("languageSelect.creatingGame")}
            </p>
          </OverlayWithLoader>
        )}
        <DialogHeader>
          <DialogTitle>{t("languageSelect.title")}</DialogTitle>
          <DialogDescription>
            {t("languageSelect.description")}
          </DialogDescription>
        </DialogHeader>
        <Select
          options={options}
          value={selectedOption}
          onChange={(option) =>
            setSelectedTemplate(option?.template ?? undefined)
          }
          isDisabled={isCreating}
        />
        <div>{t("languageSelect.gameName")}</div>
        <Input
          ref={inputRef}
          value={gameName ?? ""}
          onClick={() => inputRef.current?.select()}
          onChange={(e) => setGameName(e.target.value || undefined)}
          placeholder={t("languageSelect.gameNamePlaceholder")}
        />
        <DialogFooter>
          <Button
            disabled={!selectedTemplate || isCreating}
            onClick={handleCreateGame}
          >
            {t("languageSelect.accept")}
          </Button>
          <Button variant="secondary" onClick={close} disabled={isCreating}>
            {t("languageSelect.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
