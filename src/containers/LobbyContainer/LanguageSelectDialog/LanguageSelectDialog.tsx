import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { createGame } from "@/services/collections/game/game";
import { useGetLanguageTemplates } from "@/services/collections/letterValueMap/languageTemplate.hooks";
import { LanguageTemplate } from "@/services/collections/letterValueMap/languageTemplate.model";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

interface Props {
  close: () => void;
}
export const LanguageSelectDialog = ({ close }: Props) => {
  // Data
  const { user } = useAuth();
  const templates = useGetLanguageTemplates();

  // Hooks
  const navigate = useNavigate();

  // State
  const [selectedTemplate, setSelectedTemplate] = useState<
    LanguageTemplate | undefined
  >();

  if (!templates) return null;

  // Handlers
  const handleCreateGame = async () => {
    if (!user || !selectedTemplate) return;

    try {
      const gameId = await createGame(db, user.uid, selectedTemplate);
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error("Failed to create game:", error);
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
        <DialogHeader>
          <DialogTitle>Select language</DialogTitle>
          <DialogDescription>Select a language from the list</DialogDescription>
        </DialogHeader>
        <Select
          options={options}
          value={selectedOption}
          onChange={(option) =>
            setSelectedTemplate(option?.template ?? undefined)
          }
        />
        <DialogFooter>
          <Button disabled={!selectedTemplate} onClick={handleCreateGame}>
            Accept
          </Button>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
